import { beforeEach, describe, expect, it } from "vitest";
import { chatCompletionsFormat, messagesFormat, responsesFormat } from "@/lib/gateway/formats";
import { estimateTokens } from "@/lib/gateway/pricing";
import { handleGatewayRequest } from "@/lib/gateway/pipeline";
import { FakeRepo, alias, fakeFetch, gatewayRequest, model, openaiStream, provider, readSse, sseResponse } from "./helpers";

let repo: FakeRepo;

beforeEach(() => {
  repo = new FakeRepo();
  repo.addProvider(provider("qwen", { vendor: "alibaba", name: "Alibaba" }), model("qwen", "qwen-max", { display_name: "Qwen Max" }));
  repo.addProvider(provider("gemini", { vendor: "google", name: "Google" }), model("gemini", "gemini-2.5-pro", { display_name: "Gemini 2.5 Pro" }));
  repo.addProvider(provider("deepseek", { vendor: "deepseek", name: "DeepSeek" }), model("deepseek", "deepseek-chat", { display_name: "DeepSeek V3" }));
  repo.aliases = [alias()];
});

const chatBody = { model: "premium-model", messages: [{ role: "user", content: "hi" }] };
const call = (body: unknown, impl: typeof fetch, path = "/v1/chat/completions", format = chatCompletionsFormat) =>
  handleGatewayRequest(gatewayRequest(path, body), format, { repo, fetchImpl: impl });

describe("alias routing", () => {
  it("routes premium-model to qwen/qwen-max and answers with the public model id", async () => {
    const { impl, calls } = fakeFetch(() => openaiStream("Hello there"));
    const res = await call(chatBody, impl);

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.model).toBe("premium-model");
    expect(json.choices[0].message.content).toBe("Hello there");
    expect(json.usage).toMatchObject({ prompt_tokens: 100, completion_tokens: 50, total_tokens: 150 });

    expect(calls[0].url).toBe("https://qwen.example/v1/chat/completions");
    expect(calls[0].body.model).toBe("qwen-max");

    expect(repo.records[0]).toMatchObject({
      publicModel: "premium-model", realModel: "qwen/qwen-max", provider: "qwen", status: "success",
      inputTokens: 100, outputTokens: 50, fallbackUsed: false, errorType: null,
    });
  });

  it("switching the alias Qwen -> Gemini -> DeepSeek needs no client change", async () => {
    const { impl, calls } = fakeFetch(() => openaiStream("ok"));
    const targets: Array<[string, string]> = [["qwen", "qwen-max"], ["gemini", "gemini-2.5-pro"], ["deepseek", "deepseek-chat"]];
    for (const [p, m] of targets) {
      repo.aliases = [alias({ provider: p, provider_model: m })]; // = admin "re-route" (one UPDATE)
      const json = await (await call(chatBody, impl)).json(); // identical client request each time
      expect(json.model).toBe("premium-model");
    }
    expect(calls.map((c) => [new URL(c.url).hostname, c.body.model])).toEqual([
      ["qwen.example", "qwen-max"], ["gemini.example", "gemini-2.5-pro"], ["deepseek.example", "deepseek-chat"],
    ]);
    expect(repo.records.map((r) => r.realModel)).toEqual(["qwen/qwen-max", "gemini/gemini-2.5-pro", "deepseek/deepseek-chat"]);
    expect(new Set(repo.records.map((r) => r.publicModel))).toEqual(new Set(["premium-model"]));
  });

  it("a disabled alias returns 404 without contacting any provider", async () => {
    repo.aliases = [alias({ enabled: false })];
    const { impl, calls } = fakeFetch(() => openaiStream("x"));
    const res = await call(chatBody, impl);
    expect(res.status).toBe(404);
    expect((await res.json()).error.code).toBe("model_not_found");
    expect(calls).toHaveLength(0);
  });
});

describe("identity metadata", () => {
  it("adds ONE short system line naming product + backend, before the user's own system prompt", async () => {
    const { impl, calls } = fakeFetch(() => openaiStream("ok"));
    const body = { ...chatBody, messages: [{ role: "system", content: "Be brief." }, { role: "user", content: "What model are you?" }] };
    await call(body, impl);
    const sent = calls[0].body.messages as Array<{ role: string; content: string }>;
    expect(sent[0]).toEqual({
      role: "system",
      content: "Product model: TokenAPI Pro. Backend: Qwen Max (Alibaba). If asked about model identity, state both accurately; otherwise do not mention them.",
    });
    expect(sent[1]).toEqual({ role: "system", content: "Be brief." });
    expect(sent).toHaveLength(3);
  });

  it("is short: well under 50 tokens", () => {
    const line = "Product model: TokenAPI Pro. Backend: Qwen 3.7 Flash (Alibaba). If asked about model identity, state both accurately; otherwise do not mention them.";
    expect(estimateTokens(line)).toBeLessThan(50);
  });

  it("follows the alias when it is re-routed", async () => {
    repo.aliases = [alias({ provider: "gemini", provider_model: "gemini-2.5-pro" })];
    const { impl, calls } = fakeFetch(() => openaiStream("ok"));
    await call(chatBody, impl);
    expect((calls[0].body.messages as Array<{ content: string }>)[0].content).toContain("Backend: Gemini 2.5 Pro (Google)");
  });

  it("can be switched off per alias", async () => {
    repo.aliases = [alias({ inject_identity: false })];
    const { impl, calls } = fakeFetch(() => openaiStream("ok"));
    await call(chatBody, impl);
    expect(calls[0].body.messages).toEqual(chatBody.messages);
  });
});

describe("auth & limits", () => {
  const ok = () => fakeFetch(() => openaiStream("ok")).impl;

  it("401 without key, and with a wrong key", async () => {
    const r1 = await handleGatewayRequest(gatewayRequest("/v1/chat/completions", chatBody, {}), chatCompletionsFormat, { repo, fetchImpl: ok() });
    expect(r1.status).toBe(401);
    const r2 = await handleGatewayRequest(gatewayRequest("/v1/chat/completions", chatBody, { authorization: "Bearer nope" }), chatCompletionsFormat, { repo, fetchImpl: ok() });
    expect(r2.status).toBe(401);
  });

  it("accepts the Anthropic-style x-api-key header", async () => {
    const r = await handleGatewayRequest(gatewayRequest("/v1/chat/completions", chatBody, { "x-api-key": "sk-tk-test-key" }), chatCompletionsFormat, { repo, fetchImpl: ok() });
    expect(r.status).toBe(200);
  });

  it("403 when the key is restricted to other aliases", async () => {
    repo.keyCtx = { ...repo.keyCtx, allowedAliases: ["cheap-model"] };
    expect((await call(chatBody, ok())).status).toBe(403);
  });

  it("429 once the per-minute limit is exceeded", async () => {
    repo.keyCtx = { ...repo.keyCtx, rpmLimit: 2 };
    const now = () => 1_700_000_000_000;
    const statuses = [];
    for (let i = 0; i < 3; i++) {
      const r = await handleGatewayRequest(gatewayRequest("/v1/chat/completions", chatBody), chatCompletionsFormat, { repo, fetchImpl: ok(), now });
      statuses.push(r.status);
    }
    expect(statuses).toEqual([200, 200, 429]);
  });
});

describe("streaming", () => {
  it("chat: rewrites id/model on every chunk, hides upstream usage unless requested, ends with [DONE]", async () => {
    const { impl } = fakeFetch(() => openaiStream("Hello"));
    const res = await call({ ...chatBody, stream: true }, impl);
    expect(res.headers.get("content-type")).toContain("text/event-stream");
    const events = await readSse(res);
    const chunks = events.filter((e) => e.data !== "[DONE]").map((e) => e.data);
    expect(chunks.every((c) => c.model === "premium-model" && c.id.startsWith("gen-"))).toBe(true);
    expect(chunks.map((c) => c.choices[0]?.delta?.content ?? "").join("")).toBe("Hello");
    expect(chunks.some((c) => c.usage)).toBe(false);
    expect(events.at(-1)?.data).toBe("[DONE]");
    expect(repo.records[0]).toMatchObject({ stream: true, status: "success", inputTokens: 100 });
  });

  it("chat: emits a usage chunk when stream_options.include_usage is set", async () => {
    const { impl } = fakeFetch(() => openaiStream("Hello"));
    const events = await readSse(await call({ ...chatBody, stream: true, stream_options: { include_usage: true } }, impl));
    expect(events.at(-2)?.data.usage).toMatchObject({ prompt_tokens: 100, completion_tokens: 50 });
  });

  it("responses: emits the Responses event sequence", async () => {
    const { impl } = fakeFetch(() => openaiStream("Hi!"));
    const types = (await readSse(await call({ model: "premium-model", input: "hello", stream: true }, impl, "/v1/responses", responsesFormat))).map((e) => e.event);
    expect(types[0]).toBe("response.created");
    expect(types).toContain("response.output_text.delta");
    expect(types.at(-1)).toBe("response.completed");
  });

  it("messages: emits the Anthropic event sequence", async () => {
    const { impl } = fakeFetch(() => openaiStream("Hi!"));
    const events = await readSse(await call({ model: "premium-model", max_tokens: 100, messages: [{ role: "user", content: "hello" }], stream: true }, impl, "/v1/messages", messagesFormat));
    expect(events.map((e) => e.event)).toEqual([
      "message_start", "content_block_start", "content_block_delta", "content_block_delta", "content_block_stop", "message_delta", "message_stop",
    ]);
    expect(events[0].data.message.model).toBe("premium-model");
  });
});

describe("non-stream formats", () => {
  it("responses: returns a response object with output_text", async () => {
    const { impl, calls } = fakeFetch(() => openaiStream("Hi!"));
    const json = await (await call({ model: "premium-model", instructions: "be nice", input: "hello" }, impl, "/v1/responses", responsesFormat)).json();
    expect(json).toMatchObject({ object: "response", status: "completed", model: "premium-model", output_text: "Hi!" });
    expect(json.usage).toMatchObject({ input_tokens: 100, output_tokens: 50 });
    expect((calls[0].body.messages as Array<{ role: string }>).map((m) => m.role)).toEqual(["system", "system", "user"]);
  });

  it("responses: previous_response_id is still rejected (hook not wired yet)", async () => {
    const { impl } = fakeFetch(() => openaiStream("x"));
    const res = await call({ model: "premium-model", input: "x", previous_response_id: "resp_1" }, impl, "/v1/responses", responsesFormat);
    expect(res.status).toBe(400);
  });

  it("messages: returns an Anthropic message and uses the Anthropic error shape", async () => {
    const { impl } = fakeFetch(() => openaiStream("Hi!"));
    const ok = await call({ model: "premium-model", max_tokens: 10, messages: [{ role: "user", content: "hello" }] }, impl, "/v1/messages", messagesFormat);
    expect(await ok.json()).toMatchObject({ type: "message", model: "premium-model", content: [{ type: "text", text: "Hi!" }], stop_reason: "end_turn" });
    const bad = await call({ model: "nope", max_tokens: 10, messages: [] }, impl, "/v1/messages", messagesFormat);
    expect(await bad.json()).toMatchObject({ type: "error", error: { type: "not_found_error" } });
  });
});

describe("anthropic upstream", () => {
  it("translates request + SSE so an Anthropic-backed alias works over the chat API", async () => {
    repo.addProvider(provider("anthropic", { vendor: "anthropic", adapter: "anthropic", api_base: "https://anthropic.example/v1" }), model("anthropic", "claude-x", { display_name: "Claude X" }));
    repo.aliases = [alias({ provider: "anthropic", provider_model: "claude-x" })];
    const { impl, calls } = fakeFetch(() =>
      sseResponse([
        { event: "message_start", data: { type: "message_start", message: { usage: { input_tokens: 20, cache_read_input_tokens: 5, output_tokens: 1 } } } },
        { event: "content_block_start", data: { type: "content_block_start", index: 0, content_block: { type: "text", text: "" } } },
        { event: "content_block_delta", data: { type: "content_block_delta", index: 0, delta: { type: "text_delta", text: "Bonjour" } } },
        { event: "content_block_stop", data: { type: "content_block_stop", index: 0 } },
        { event: "message_delta", data: { type: "message_delta", delta: { stop_reason: "end_turn" }, usage: { output_tokens: 7 } } },
        { event: "message_stop", data: { type: "message_stop" } },
      ]),
    );
    const json = await (await call(chatBody, impl)).json();
    expect(json.choices[0].message.content).toBe("Bonjour");
    expect(json.usage).toMatchObject({ prompt_tokens: 25, completion_tokens: 7, cached_tokens: 5 });
    expect(calls[0].url).toBe("https://anthropic.example/v1/messages");
    expect(typeof calls[0].body.system).toBe("string");
    expect(calls[0].body.max_tokens).toBe(1000); // enforced output cap (model max_output_tokens)
  });
});
