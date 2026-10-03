// Drives the gateway with the official OpenAI and Anthropic SDKs (no network):
// SDK -> custom fetch -> route format -> pipeline -> fake upstream.

import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { beforeEach, describe, expect, it } from "vitest";
import { chatCompletionsFormat, messagesFormat, responsesFormat } from "@/lib/gateway/formats";
import { toPublicModel } from "@/lib/gateway/models";
import { handleGatewayRequest, type InboundFormat } from "@/lib/gateway/pipeline";
import { FakeRepo, TEST_KEY, alias, model, openaiStream, provider, sseResponse } from "./helpers";

let repo: FakeRepo;
let upstream: () => Response;

const ROUTES: Record<string, InboundFormat> = {
  "/v1/chat/completions": chatCompletionsFormat,
  "/v1/responses": responsesFormat,
  "/v1/messages": messagesFormat,
};

const gatewayFetch = (async (input: string | URL | Request, init?: RequestInit) => {
  const req = new Request(input, init);
  const path = new URL(req.url).pathname;
  if (path === "/v1/models") return Response.json({ object: "list", data: (await repo.listPublicAliases()).map((a) => toPublicModel(a)) });
  const format = ROUTES[path];
  if (!format) return new Response("not found", { status: 404 });
  return handleGatewayRequest(req, format, { repo, fetchImpl: (async () => upstream()) as typeof fetch });
}) as typeof fetch;

const openai = () => new OpenAI({ baseURL: "https://api.example.com/v1", apiKey: TEST_KEY, fetch: gatewayFetch, maxRetries: 0 });
const anthropic = () => new Anthropic({ baseURL: "https://api.example.com", apiKey: TEST_KEY, fetch: gatewayFetch, maxRetries: 0 });

const toolCallStream = () =>
  sseResponse([
    { data: { choices: [{ index: 0, delta: { role: "assistant", tool_calls: [{ index: 0, id: "call_1", type: "function", function: { name: "get_weather", arguments: "" } }] }, finish_reason: null }] } },
    { data: { choices: [{ index: 0, delta: { tool_calls: [{ index: 0, function: { arguments: "{\"city\":" } }] }, finish_reason: null }] } },
    { data: { choices: [{ index: 0, delta: { tool_calls: [{ index: 0, function: { arguments: "\"Paris\"}" } }] }, finish_reason: "tool_calls" }] } },
    { data: { choices: [], usage: { prompt_tokens: 30, completion_tokens: 12, total_tokens: 42 } } },
    { data: "[DONE]" },
  ]);

beforeEach(() => {
  repo = new FakeRepo();
  repo.addProvider(provider("qwen", { vendor: "alibaba" }), model("qwen", "qwen-max", { display_name: "Qwen Max" }));
  repo.aliases = [alias()];
  upstream = () => openaiStream("Hello from the gateway");
});

describe("OpenAI SDK", () => {
  it("chat.completions.create (non-stream)", async () => {
    const r = await openai().chat.completions.create({ model: "premium-model", messages: [{ role: "user", content: "hi" }] });
    expect(r.model).toBe("premium-model");
    expect(r.choices[0].message.content).toBe("Hello from the gateway");
    expect(r.usage?.total_tokens).toBe(150);
  });

  it("chat.completions.create (stream) with usage", async () => {
    const stream = await openai().chat.completions.create({
      model: "premium-model", messages: [{ role: "user", content: "hi" }], stream: true, stream_options: { include_usage: true },
    });
    let text = "";
    let usage = null;
    for await (const chunk of stream) {
      expect(chunk.model).toBe("premium-model");
      text += chunk.choices[0]?.delta?.content ?? "";
      if (chunk.usage) usage = chunk.usage;
    }
    expect(text).toBe("Hello from the gateway");
    expect(usage).toMatchObject({ prompt_tokens: 100, completion_tokens: 50 });
  });

  it("streaming tool calls reassemble via the SDK helper", async () => {
    upstream = toolCallStream;
    const runner = openai().chat.completions.stream({
      model: "premium-model",
      messages: [{ role: "user", content: "weather?" }],
      tools: [{ type: "function", function: { name: "get_weather", parameters: { type: "object", properties: { city: { type: "string" } } } } }],
    });
    const final = await runner.finalChatCompletion();
    expect(final.choices[0].message.tool_calls?.[0]).toMatchObject({ id: "call_1", function: { name: "get_weather", arguments: "{\"city\":\"Paris\"}" } });
    expect(final.choices[0].finish_reason).toBe("tool_calls");
  });

  it("responses.create (non-stream + stream)", async () => {
    const r = await openai().responses.create({ model: "premium-model", input: "hi", instructions: "be kind" });
    expect(r.output_text).toBe("Hello from the gateway");
    expect(r.model).toBe("premium-model");

    const stream = openai().responses.stream({ model: "premium-model", input: "hi" });
    let deltas = "";
    stream.on("response.output_text.delta", (e) => { deltas += e.delta; });
    const final = await stream.finalResponse();
    expect(deltas).toBe("Hello from the gateway");
    expect(final.output_text).toBe("Hello from the gateway");
  });

  it("responses: function_call output item", async () => {
    upstream = toolCallStream;
    const r = await openai().responses.create({
      model: "premium-model", input: "weather?",
      tools: [{ type: "function", name: "get_weather", parameters: { type: "object", properties: {} }, strict: false }],
    });
    expect(r.output[0]).toMatchObject({ type: "function_call", call_id: "call_1", name: "get_weather", arguments: "{\"city\":\"Paris\"}" });
  });

  it("models.list returns aliases only, with public pricing", async () => {
    const ids = [];
    for await (const m of openai().models.list()) ids.push(m);
    expect(ids.map((m) => m.id)).toEqual(["premium-model"]);
    // qwen-max $1/$2 per 1M x 1.5 multiplier, as USD per token
    expect(ids[0]).toMatchObject({ display_name: "TokenAPI Pro", pricing: { prompt: "0.0000015", completion: "0.000003" } });
    expect(JSON.stringify(ids[0])).not.toContain("qwen");
  });

  it("surfaces gateway errors as typed SDK errors", async () => {
    await expect(openai().chat.completions.create({ model: "missing", messages: [{ role: "user", content: "x" }] }))
      .rejects.toMatchObject({ status: 404, code: "model_not_found" });
    repo.balance = 0;
    await expect(openai().chat.completions.create({ model: "premium-model", messages: [{ role: "user", content: "x" }] }))
      .rejects.toBeInstanceOf(OpenAI.APIError);
  });
});

describe("Anthropic SDK against /v1/messages", () => {
  it("messages.create (non-stream)", async () => {
    const m = await anthropic().messages.create({ model: "premium-model", max_tokens: 100, messages: [{ role: "user", content: "hi" }] });
    expect(m.model).toBe("premium-model");
    expect(m.content[0]).toMatchObject({ type: "text", text: "Hello from the gateway" });
    expect(m.usage.output_tokens).toBe(50);
  });

  it("messages.stream with tool use", async () => {
    upstream = toolCallStream;
    const stream = anthropic().messages.stream({
      model: "premium-model", max_tokens: 100, messages: [{ role: "user", content: "weather?" }],
      tools: [{ name: "get_weather", input_schema: { type: "object", properties: {} } }],
    });
    const final = await stream.finalMessage();
    expect(final.stop_reason).toBe("tool_use");
    expect(final.content[0]).toMatchObject({ type: "tool_use", id: "call_1", name: "get_weather", input: { city: "Paris" } });
  });
});
