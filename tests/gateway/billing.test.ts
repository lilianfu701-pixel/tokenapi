import { beforeEach, describe, expect, it } from "vitest";
import { chatCompletionsFormat } from "@/lib/gateway/formats";
import { handleGatewayRequest } from "@/lib/gateway/pipeline";
import { FakeRepo, alias, fakeFetch, gatewayRequest, model, openaiStream, provider, readSse, sseResponse } from "./helpers";

let repo: FakeRepo;

beforeEach(() => {
  repo = new FakeRepo();
  // $1 / $2 per 1M tokens, max 1000 output tokens; alias multiplier 1.5
  repo.addProvider(provider("qwen", { vendor: "alibaba" }), model("qwen", "qwen-max"));
  repo.aliases = [alias()];
});

const chatBody = { model: "premium-model", messages: [{ role: "user", content: "hi" }] };
const call = (impl: typeof fetch, body: unknown = chatBody) =>
  handleGatewayRequest(gatewayRequest("/v1/chat/completions", body), chatCompletionsFormat, { repo, fetchImpl: impl });

describe("charging", () => {
  it("charges upstream cost x multiplier in integer microusd, and settles the hold exactly", async () => {
    // 100 in @ $1/M + 50 out @ $2/M = 200 microusd cost; x1.5 = 300 charged
    const { impl } = fakeFetch(() => openaiStream("ok"));
    const before = repo.balance;
    await call(impl);
    const rec = repo.records[0];
    expect(rec).toMatchObject({ upstreamCostMicrousd: 200, customerChargeMicrousd: 300, usageEstimated: false });
    expect(rec.holdMicrousd).toBeGreaterThan(300);
    expect(Number.isInteger(rec.holdMicrousd)).toBe(true);
    expect(repo.balance).toBe(before - 300);
    expect(repo.holds.size).toBe(0);
  });

  it("fixed public prices are charged instead of the multiplier", async () => {
    repo.aliases = [alias({ public_input_price: 10, public_output_price: 20 })];
    const { impl } = fakeFetch(() => openaiStream("ok"));
    await call(impl);
    expect(repo.records[0].customerChargeMicrousd).toBe(100 * 10 + 50 * 20);
  });

  it("estimates usage when the upstream omits it", async () => {
    const { impl } = fakeFetch(() => sseResponse([{ data: { choices: [{ index: 0, delta: { content: "abcdefgh" }, finish_reason: "stop" }] } }, { data: "[DONE]" }]));
    await call(impl);
    expect(repo.records[0]).toMatchObject({ usageEstimated: true, outputTokens: 2 });
  });
});

describe("pre-authorization", () => {
  it("enforces the output cap upstream so the hold is a true upper bound", async () => {
    const { impl, calls } = fakeFetch(() => openaiStream("ok"));
    await call(impl); // no max_tokens from client -> model cap
    await call(impl, { ...chatBody, max_tokens: 50 }); // client cap respected
    await call(impl, { ...chatBody, max_tokens: 999_999 }); // clamped to model cap
    expect(calls.map((c) => c.body.max_tokens)).toEqual([1000, 50, 1000]);
  });

  it("refuses with 402 when the balance cannot cover the worst case, without calling upstream", async () => {
    repo.balance = 1000; // < hold (~3000 microusd for 1000 output tokens)
    const { impl, calls } = fakeFetch(() => openaiStream("ok"));
    const res = await call(impl);
    expect(res.status).toBe(402);
    expect((await res.json()).error).toMatchObject({ code: "insufficient_quota" });
    expect(calls).toHaveLength(0);
    expect(repo.balance).toBe(1000);
  });

  it("a smaller max_tokens lowers the hold so a small balance still works", async () => {
    repo.balance = 1000;
    const { impl } = fakeFetch(() => openaiStream("ok", { prompt_tokens: 10, completion_tokens: 10, total_tokens: 20 }));
    const res = await call(impl, { ...chatBody, max_tokens: 100 });
    expect(res.status).toBe(200);
    expect(repo.balance).toBe(1000 - 45); // (10*1 + 10*2) * 1.5
  });

  it("402 when the key's spend limit would be exceeded", async () => {
    repo.keySpendLimit = 100;
    const { impl } = fakeFetch(() => openaiStream("ok"));
    const res = await call(impl);
    expect(res.status).toBe(402);
    expect((await res.json()).error.code).toBe("key_spend_limit");
  });

  it("streaming: hold is settled when the stream ends", async () => {
    const { impl } = fakeFetch(() => openaiStream("Hello"));
    const before = repo.balance;
    const res = await call(impl, { ...chatBody, stream: true });
    expect(repo.holds.size).toBe(1); // reserved while streaming
    await readSse(res);
    await new Promise((r) => setTimeout(r, 0));
    expect(repo.holds.size).toBe(0);
    expect(repo.balance).toBe(before - 300);
  });

  it("streaming: a client disconnect still settles (partial usage), never leaves a hold", async () => {
    let release!: () => void;
    const gate = new Promise<void>((r) => { release = r; });
    const { impl } = fakeFetch(() => {
      const enc = new TextEncoder();
      return new Response(new ReadableStream({
        async start(c) {
          c.enqueue(enc.encode(`data: ${JSON.stringify({ choices: [{ index: 0, delta: { content: "partial" }, finish_reason: null }] })}\n\n`));
          await gate; // upstream keeps the stream open
          c.close();
        },
      }), { status: 200 });
    });
    const res = await call(impl, { ...chatBody, stream: true });
    const reader = res.body!.getReader();
    await reader.read();
    await reader.cancel();
    release();
    await new Promise((r) => setTimeout(r, 10));
    expect(repo.holds.size).toBe(0);
    expect(repo.records[0]).toMatchObject({ status: "client_aborted", usageEstimated: true });
    expect(repo.records[0].customerChargeMicrousd).toBeGreaterThan(0);
  });
});

describe("concurrency", () => {
  it("50 concurrent requests can never overdraw: only as many as the balance can hold get through", async () => {
    // Each request holds ~3 cents of worst case; the balance covers exactly 5 holds.
    const { impl } = fakeFetch(async () => {
      await new Promise((r) => setTimeout(r, 5)); // keep holds open while the others arrive
      return openaiStream("ok");
    });
    const probe = await call(fakeFetch(() => openaiStream("ok")).impl);
    await probe.json();
    const hold = repo.records[0].holdMicrousd;
    repo.records = [];
    repo.balance = hold * 5;

    const results = await Promise.all(Array.from({ length: 50 }, () => call(impl)));
    const statuses = results.map((r) => r.status);
    expect(statuses.filter((s) => s === 200)).toHaveLength(5);
    expect(statuses.filter((s) => s === 402)).toHaveLength(45);
    expect(repo.balance).toBe(hold * 5 - 5 * 300); // exactly 5 x real charge
    expect(repo.balance).toBeGreaterThanOrEqual(0);
    expect(repo.holds.size).toBe(0);
  });
});
