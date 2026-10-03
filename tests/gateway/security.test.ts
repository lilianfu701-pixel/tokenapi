import { beforeEach, describe, expect, it } from "vitest";
import { chatCompletionsFormat } from "@/lib/gateway/formats";
import { toPublicModel } from "@/lib/gateway/models";
import { handleGatewayRequest } from "@/lib/gateway/pipeline";
import { FakeRepo, alias, fakeFetch, fallback, gatewayRequest, model, openaiStream, provider, readSse } from "./helpers";

const SECRET = "sk-upstream-secret-qwen-0123456789";
let repo: FakeRepo;

beforeEach(() => {
  repo = new FakeRepo();
  repo.addProvider(provider("qwen", { vendor: "alibaba", name: "Alibaba", api_base: "https://dashscope.internal.example/compatible-mode/v1" }),
    model("qwen", "qwen3.7-flash", { display_name: "Qwen 3.7 Flash", capabilities: ["tools", "json_output"], context_length: 131072 }));
  repo.addProvider(provider("gemini", { vendor: "google", name: "Google" }), model("gemini", "gemini-2.5-pro"));
  repo.aliases = [alias({ provider: "qwen", provider_model: "qwen3.7-flash", description: "Balanced quality and speed" })];
});

const chatBody = { model: "premium-model", messages: [{ role: "user", content: "hi" }] };
const call = (impl: typeof fetch, body: unknown = chatBody) =>
  handleGatewayRequest(gatewayRequest("/v1/chat/completions", body), chatCompletionsFormat, { repo, fetchImpl: impl });

describe("upstream API keys never leak", () => {
  it("is sent only to the upstream, as the Authorization header", async () => {
    const { impl, calls } = fakeFetch(() => openaiStream("ok"));
    const res = await call(impl);
    expect(calls[0].headers.Authorization).toBe(`Bearer ${SECRET}`);
    expect(JSON.stringify(calls[0].body)).not.toContain(SECRET);
    const text = await res.text();
    expect(text).not.toContain(SECRET);
    expect(JSON.stringify([...res.headers])).not.toContain(SECRET);
  });

  it("is redacted when an upstream echoes it in a 400 error (client response + log)", async () => {
    const { impl } = fakeFetch(() => new Response(JSON.stringify({ error: { message: `bad request for key ${SECRET}` } }), { status: 400 }));
    const res = await call(impl);
    const body = await res.text();
    expect(res.status).toBe(400);
    expect(body).not.toContain(SECRET);
    expect(body).toContain("[REDACTED]");
    expect(JSON.stringify(repo.records)).not.toContain(SECRET);
  });

  it("is redacted from 401 messages stored in attempts", async () => {
    repo.fallbacks = [fallback("gemini", "gemini-2.5-pro", 1)];
    const { impl } = fakeFetch((c) => (c.url.includes("dashscope")
      ? new Response(`Incorrect API key provided: ${SECRET}`, { status: 401 })
      : openaiStream("ok")));
    await call(impl);
    expect(JSON.stringify(repo.records)).not.toContain(SECRET);
    expect(repo.records[0].attempts[0]).toMatchObject({ status: 401, error_type: "provider_config" });
    expect(repo.records[0].attempts[0].error).toContain("[REDACTED]");
  });

  it("is redacted from mid-stream errors sent to the client", async () => {
    const { impl } = fakeFetch(() => {
      const enc = new TextEncoder();
      return new Response(new ReadableStream({
        start(c) {
          c.enqueue(enc.encode(`data: ${JSON.stringify({ choices: [{ index: 0, delta: { content: "a" }, finish_reason: null }] })}\n\n`));
          c.enqueue(enc.encode(`data: ${JSON.stringify({ error: { message: `quota for ${SECRET}` } })}\n\n`));
          c.close();
        },
      }));
    });
    const res = await call(impl, { ...chatBody, stream: true });
    const raw = JSON.stringify(await readSse(res));
    await new Promise((r) => setTimeout(r, 0));
    expect(raw).not.toContain(SECRET);
    expect(JSON.stringify(repo.records)).not.toContain(SECRET);
    expect(repo.records[0]).toMatchObject({ status: "error", errorType: "stream_error" });
  });

  it("client-facing responses never name the provider or real model on normal answers", async () => {
    const { impl } = fakeFetch(() => openaiStream("Hello"));
    const text = await (await call(impl)).text();
    for (const leak of ["qwen", "Qwen", "Alibaba", "dashscope", "qwen3.7-flash"]) expect(text).not.toContain(leak);
  });
});

describe("/v1/models exposes only public fields", () => {
  it("allow-listed shape; no provider, real model, upstream URL or vendor names", async () => {
    const [entry] = (await repo.listPublicAliases()).map((a) => toPublicModel(a));
    expect(Object.keys(entry).sort()).toEqual(
      ["capabilities", "context_length", "created", "description", "display_name", "id", "name", "object", "owned_by", "pricing"].sort(),
    );
    expect(entry).toMatchObject({
      id: "premium-model",
      display_name: "TokenAPI Pro",
      capabilities: ["streaming", "tools", "json_output"],
      context_length: 131072,
      owned_by: "tokenapi",
      pricing: { currency: "USD", input_per_million: 1.5, output_per_million: 3 },
    });
    const serialized = JSON.stringify(entry).toLowerCase();
    for (const leak of ["qwen", "alibaba", "dashscope", "example", "provider", "real_model", "api_base", SECRET.toLowerCase()]) {
      expect(serialized).not.toContain(leak);
    }
  });

  it("disabled aliases are not listed", async () => {
    repo.aliases = [alias({ enabled: false })];
    expect(await repo.listPublicAliases()).toHaveLength(0);
  });
});
