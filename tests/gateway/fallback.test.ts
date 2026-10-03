import { beforeEach, describe, expect, it } from "vitest";
import { chatCompletionsFormat } from "@/lib/gateway/formats";
import { handleGatewayRequest } from "@/lib/gateway/pipeline";
import { CREDENTIAL_COOLDOWN_MS } from "@/lib/gateway/route-runner";
import { FakeRepo, alias, fakeFetch, fallback, gatewayRequest, model, openaiStream, provider, sseResponse } from "./helpers";

let repo: FakeRepo;
let clock: number;

beforeEach(() => {
  clock = 1_700_000_000_000;
  repo = new FakeRepo(() => clock);
  repo.addProvider(provider("qwen", { vendor: "alibaba" }), model("qwen", "qwen-max"));
  repo.addProvider(provider("gemini", { vendor: "google" }), model("gemini", "gemini-2.5-pro"));
  repo.addProvider(provider("deepseek", { vendor: "deepseek" }), model("deepseek", "deepseek-chat"));
  repo.aliases = [alias()];
  repo.fallbacks = [fallback("gemini", "gemini-2.5-pro", 1), fallback("deepseek", "deepseek-chat", 2)];
});

const chatBody = { model: "premium-model", messages: [{ role: "user", content: "hi" }] };
const call = (impl: typeof fetch, body: unknown = chatBody) =>
  handleGatewayRequest(gatewayRequest("/v1/chat/completions", body), chatCompletionsFormat, { repo, fetchImpl: impl, now: () => clock });
const hostOf = (url: string) => new URL(url).hostname.split(".")[0];
const json = (status: number, message: string) => new Response(JSON.stringify({ error: { message } }), { status });

describe("fallback chain", () => {
  it("5xx on primary -> next by priority; log records both attempts and fallback_used", async () => {
    const { impl, calls } = fakeFetch((c) => (c.url.includes("qwen") ? json(503, "overloaded") : openaiStream("rescued")));
    const res = await call(impl);
    expect(res.status).toBe(200);
    expect((await res.json()).choices[0].message.content).toBe("rescued");
    expect(calls.map((c) => hostOf(c.url))).toEqual(["qwen", "gemini"]);
    const rec = repo.records[0];
    expect(rec).toMatchObject({ realModel: "gemini/gemini-2.5-pro", fallbackUsed: true, status: "success" });
    expect(rec.attempts.map((a) => [a.real_model, a.status, a.error_type])).toEqual([
      ["qwen/qwen-max", 503, "upstream_unavailable"],
      ["gemini/gemini-2.5-pro", 200, null],
    ]);
  });

  it("respects priority order, not insertion order", async () => {
    repo.fallbacks = [fallback("deepseek", "deepseek-chat", 5), fallback("gemini", "gemini-2.5-pro", 2)];
    const { impl, calls } = fakeFetch((c) => (c.url.includes("deepseek") ? openaiStream("ok") : json(500, "down")));
    await call(impl);
    expect(calls.map((c) => hostOf(c.url))).toEqual(["qwen", "gemini", "deepseek"]);
  });

  it("skips disabled fallbacks, disabled providers and disabled models", async () => {
    repo.fallbacks = [fallback("gemini", "gemini-2.5-pro", 1, { enabled: false }), fallback("deepseek", "deepseek-chat", 2)];
    repo.providers.set("qwen", provider("qwen", { enabled: false }));
    const { impl, calls } = fakeFetch(() => openaiStream("ok"));
    await call(impl);
    expect(calls.map((c) => hostOf(c.url))).toEqual(["deepseek"]);
  });

  it("429 and timeouts also fall back", async () => {
    repo.providers.set("qwen", provider("qwen", { vendor: "alibaba", timeout_ms: 30 }));
    const { impl, calls } = fakeFetch((c) => {
      if (c.url.includes("qwen")) return new Promise<Response>(() => {}); // never answers
      if (c.url.includes("gemini")) return json(429, "slow down");
      return openaiStream("ok");
    });
    const res = await call(impl);
    expect(res.status).toBe(200);
    expect(calls.map((c) => hostOf(c.url))).toEqual(["qwen", "gemini", "deepseek"]);
    expect(repo.records[0].attempts.map((a) => a.error_type)).toEqual(["timeout", "rate_limited", null]);
  });

  it("an error event before the first token falls back too", async () => {
    const { impl } = fakeFetch((c) => (c.url.includes("qwen") ? sseResponse([{ data: { error: { message: "internal" } } }]) : openaiStream("ok")));
    expect((await call(impl)).status).toBe(200);
    expect(repo.records[0].realModel).toBe("gemini/gemini-2.5-pro");
  });

  it("does NOT fall back on 400 (caller's request) and refunds the hold", async () => {
    const { impl, calls } = fakeFetch(() => json(400, "context too long"));
    const before = repo.balance;
    const res = await call(impl);
    expect(res.status).toBe(400);
    expect((await res.json()).error.message).toContain("context too long");
    expect(calls).toHaveLength(1);
    expect(repo.records[0]).toMatchObject({ status: "error", errorType: "invalid_request", customerChargeMicrousd: 0 });
    expect(repo.balance).toBe(before);
  });

  it("all routes failing -> 502, every attempt logged, nothing charged", async () => {
    const { impl } = fakeFetch(() => json(500, "down"));
    const before = repo.balance;
    const res = await call(impl);
    expect(res.status).toBe(502);
    expect(repo.records[0]).toMatchObject({ status: "error", errorType: "upstream_unavailable", customerChargeMicrousd: 0, fallbackUsed: true });
    expect(repo.records[0].attempts).toHaveLength(3);
    expect(repo.balance).toBe(before);
  });
});

describe("401/403 = provider configuration error + circuit breaker", () => {
  it.each([401, 403])("HTTP %i is logged as provider_config and falls back", async (status) => {
    const { impl } = fakeFetch((c) => (c.url.includes("qwen") ? json(status, "invalid api key") : openaiStream("ok")));
    expect((await call(impl)).status).toBe(200);
    expect(repo.records[0].attempts[0]).toMatchObject({ status, error_type: "provider_config" });
  });

  it("after a 401 the bad credential is skipped (no upstream call) until the cooldown ends", async () => {
    const { impl, calls } = fakeFetch((c) => (c.url.includes("qwen") ? json(401, "invalid api key") : openaiStream("ok")));

    await call(impl); // trips the breaker
    expect(calls.map((c) => hostOf(c.url))).toEqual(["qwen", "gemini"]);

    calls.length = 0;
    await call(impl); // qwen not contacted at all
    expect(calls.map((c) => hostOf(c.url))).toEqual(["gemini"]);
    expect(repo.records[1].attempts[0]).toMatchObject({ real_model: "qwen/qwen-max", skipped: true, error_type: "provider_config" });
    expect(repo.records[1].fallbackUsed).toBe(true);

    clock += CREDENTIAL_COOLDOWN_MS + 1; // cooldown over -> retried
    calls.length = 0;
    await call(impl);
    expect(calls.map((c) => hostOf(c.url))).toEqual(["qwen", "gemini"]);
  });

  it("a 404 (model renamed upstream) is provider_config but does not block the key", async () => {
    const { impl } = fakeFetch((c) => (c.url.includes("qwen") ? json(404, "model not found") : openaiStream("ok")));
    await call(impl);
    expect(repo.records[0].attempts[0].error_type).toBe("provider_config");
    expect(repo.blocked.size).toBe(0);
  });

  it("a provider without any key is skipped and logged as provider_config", async () => {
    repo.providerKeys.qwen = null;
    const { impl, calls } = fakeFetch(() => openaiStream("ok"));
    await call(impl);
    expect(calls.map((c) => hostOf(c.url))).toEqual(["gemini"]);
    expect(repo.records[0].attempts[0]).toMatchObject({ skipped: true, error_type: "provider_config", error: "no upstream API key configured" });
  });
});
