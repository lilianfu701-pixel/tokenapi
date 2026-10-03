// Runs the real schema (scripts/setup-gateway-db.sql), the real billing functions and the
// real repo SQL on an in-process Postgres (PGlite). No Neon / network involved.
//
// Note: PGlite is a single connection, so concurrent calls are interleaved statement by
// statement rather than truly parallel. That still proves the guarantee that matters here:
// the balance check and the deduction happen inside ONE statement in the database, so no
// interleaving of requests can spend the same money twice. (On Neon the guarded UPDATE
// additionally takes a row lock across real parallel connections.)

import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { encryptSecret, hashApiKey } from "@/lib/gateway/crypto";
import { chatCompletionsFormat } from "@/lib/gateway/formats";
import { toPublicModel } from "@/lib/gateway/models";
import { handleGatewayRequest } from "@/lib/gateway/pipeline";
import { clearAliasCache, createNeonRepo, type GatewayRepo } from "@/lib/gateway/repo";
import { fakeFetch, openaiStream } from "./helpers";
import { pgliteSql } from "./pg-sql";

const ENC_KEY = "b".repeat(64);
const CLIENT_KEY = "sk-tk-pg-client-key";
const UPSTREAM_SECRET = "sk-qwen-real-upstream-secret-987654321";
const USER = "11111111-1111-1111-1111-111111111111";
const KEY = "22222222-2222-2222-2222-222222222222";

let db: PGlite;
let repo: GatewayRepo;

const q = async <T = Record<string, unknown>>(text: string, params: unknown[] = []) => (await db.query<T>(text, params)).rows;
const balance = async () => Number((await q<{ b: string }>("SELECT balance_microusd AS b FROM gateway_users WHERE id = $1", [USER]))[0].b);
const openHolds = async () => Number((await q<{ n: number }>("SELECT COUNT(*)::int AS n FROM gateway_credit_holds WHERE status = 'held'"))[0].n);

beforeAll(async () => {
  process.env.GATEWAY_ENCRYPTION_KEY = ENC_KEY;
  db = await PGlite.create();
  await db.exec(readFileSync("scripts/setup-gateway-db.sql", "utf8"));
  await db.exec(readFileSync("scripts/setup-gateway-db.sql", "utf8")); // idempotent
  repo = createNeonRepo(pgliteSql(db));
}, 60_000);

afterAll(async () => {
  await db?.close();
});

beforeEach(async () => {
  clearAliasCache();
  await db.exec(`
    TRUNCATE gateway_request_logs, gateway_credit_holds, gateway_credit_ledger, gateway_rate_limits,
      gateway_credential_health, gateway_api_keys, gateway_users, model_alias_fallbacks, model_aliases,
      gateway_models, gateway_provider_keys, gateway_providers CASCADE;
    INSERT INTO gateway_providers (id, name, vendor, adapter, api_base) VALUES
      ('qwen', 'Alibaba', 'alibaba', 'openai', 'https://dashscope.example/compatible-mode/v1'),
      ('gemini', 'Google', 'google', 'openai', 'https://gemini.example/v1beta/openai');
    INSERT INTO gateway_models (provider_id, provider_model, display_name, context_length, max_output_tokens, capabilities, input_price, output_price) VALUES
      ('qwen', 'qwen3.7-flash', 'Qwen 3.7 Flash', 131072, 1000, '{tools,json_output}', 1, 2),
      ('gemini', 'gemini-2.5-pro', 'Gemini 2.5 Pro', 1000000, 1000, '{tools,vision}', 1, 2);
    INSERT INTO model_aliases (alias, display_name, provider, provider_model, price_multiplier)
      VALUES ('premium-model', 'TokenAPI Pro', 'qwen', 'qwen3.7-flash', 1.5);
    INSERT INTO gateway_users (id, email, balance_microusd) VALUES ('${USER}', 'dev@example.com', 0);
  `);
  await q("INSERT INTO gateway_api_keys (id, user_id, key_hash, key_prefix) VALUES ($1, $2, $3, 'sk-tk-pg')", [KEY, USER, hashApiKey(CLIENT_KEY)]);
  for (const p of ["qwen", "gemini"]) {
    await q("INSERT INTO gateway_provider_keys (provider_id, label, key_ciphertext, key_hint, is_default) VALUES ($1, 'main', $2, '…4321', true)",
      [p, encryptSecret(`${UPSTREAM_SECRET}-${p}`, ENC_KEY)]);
  }
});

const request = (body: unknown = { model: "premium-model", messages: [{ role: "user", content: "hi" }] }) =>
  new Request("https://api.test/v1/chat/completions", {
    method: "POST", headers: { "content-type": "application/json", authorization: `Bearer ${CLIENT_KEY}` }, body: JSON.stringify(body),
  });

describe("schema + billing functions (SQL)", () => {
  it("reserve -> settle refunds the unused hold and writes one ledger row", async () => {
    await q("SELECT gateway_adjust_credit($1, 1000000, 'topup', 'test')", [USER]);
    expect((await q("SELECT gateway_reserve_credit('r1', $1, $2, 300000) AS r", [USER, KEY]))[0].r).toBe("ok");
    expect(await balance()).toBe(700_000);
    expect(Number((await q("SELECT gateway_settle_credit('r1', 1234) AS c"))[0].c)).toBe(1234);
    expect(await balance()).toBe(1_000_000 - 1234);
    expect(Number((await q("SELECT gateway_settle_credit('r1', 1234) AS c"))[0].c)).toBe(-1); // idempotent
    expect(await balance()).toBe(1_000_000 - 1234);
    const ledger = await q<{ reason: string; d: string }>("SELECT reason, delta_microusd::text AS d FROM gateway_credit_ledger ORDER BY id");
    expect(ledger).toEqual([{ reason: "topup", d: "1000000" }, { reason: "usage", d: "-1234" }]);
  });

  it("refuses a reservation larger than the balance, and a zero/negative balance", async () => {
    await q("SELECT gateway_adjust_credit($1, 500, 'topup', null)", [USER]);
    expect((await q("SELECT gateway_reserve_credit('r1', $1, $2, 501) AS r", [USER, KEY]))[0].r).toBe("insufficient_balance");
    expect(await balance()).toBe(500);
    await q("SELECT gateway_adjust_credit($1, -500, 'adjustment', null)", [USER]);
    expect((await q("SELECT gateway_reserve_credit('r2', $1, $2, 0) AS r", [USER, KEY]))[0].r).toBe("insufficient_balance");
  });

  it("key spend limit is enforced atomically and rolled back if the balance check fails", async () => {
    await q("UPDATE gateway_api_keys SET spend_limit_microusd = 1000 WHERE id = $1", [KEY]);
    await q("SELECT gateway_adjust_credit($1, 100, 'topup', null)", [USER]);
    expect((await q("SELECT gateway_reserve_credit('r1', $1, $2, 2000) AS r", [USER, KEY]))[0].r).toBe("key_spend_limit");
    expect((await q("SELECT gateway_reserve_credit('r2', $1, $2, 500) AS r", [USER, KEY]))[0].r).toBe("insufficient_balance");
    const spent = (await q<{ s: string }>("SELECT spent_microusd::text AS s FROM gateway_api_keys WHERE id = $1", [KEY]))[0].s;
    expect(spent).toBe("0"); // the key reservation was undone
  });

  it("expired holds are released back to the balance", async () => {
    await q("SELECT gateway_adjust_credit($1, 1000, 'topup', null)", [USER]);
    await q("SELECT gateway_reserve_credit('r1', $1, $2, 800, 0)", [USER, KEY]);
    expect(await balance()).toBe(200);
    await new Promise((r) => setTimeout(r, 5));
    expect((await q("SELECT gateway_release_expired_holds() AS n"))[0].n).toBe(1);
    expect(await balance()).toBe(1000);
    expect(Number((await q("SELECT gateway_settle_credit('r1', 100) AS c"))[0].c)).toBe(-1); // late settle is a no-op
  });

  it("200 concurrent reservations never overdraw", async () => {
    await q("SELECT gateway_adjust_credit($1, 10000, 'topup', null)", [USER]);
    const results = await Promise.all(
      Array.from({ length: 200 }, (_, i) => q<{ r: string }>("SELECT gateway_reserve_credit($1, $2, $3, 300) AS r", [`c${i}`, USER, KEY])),
    );
    const ok = results.filter((r) => r[0].r === "ok").length;
    expect(ok).toBe(33); // floor(10000 / 300)
    expect(await balance()).toBe(10000 - 33 * 300);
    expect(await balance()).toBeGreaterThanOrEqual(0);
  });
});

describe("full pipeline on Postgres", () => {
  it("serves, logs both identities, and settles: balance = topup - real charge", async () => {
    await q("SELECT gateway_adjust_credit($1, 10000000, 'topup', null)", [USER]);
    const { impl, calls } = fakeFetch(() => openaiStream("Hello", undefined, "qwen3.7-flash"));
    const res = await handleGatewayRequest(request(), chatCompletionsFormat, { repo, fetchImpl: impl });
    expect(res.status).toBe(200);
    expect((await res.json()).model).toBe("premium-model");
    expect(calls[0].headers.Authorization).toBe(`Bearer ${UPSTREAM_SECRET}-qwen`); // decrypted from DB

    const [log] = await q<Record<string, unknown>>("SELECT * FROM gateway_request_logs");
    expect(log).toMatchObject({
      public_model: "premium-model", real_model: "qwen/qwen3.7-flash", provider: "qwen", status: "success",
      input_tokens: 100, output_tokens: 50, fallback_used: false, error_type: null, error: null,
    });
    expect(Number(log.upstream_cost_microusd)).toBe(200);
    expect(Number(log.customer_charge_microusd)).toBe(300);
    expect(Number(log.latency_ms)).toBeGreaterThanOrEqual(0);
    expect(await balance()).toBe(10_000_000 - 300);
    expect(await openHolds()).toBe(0);
    expect(JSON.stringify(log)).not.toContain(UPSTREAM_SECRET);
  });

  it("concurrent requests through the whole gateway cannot overdraw the account", async () => {
    // Find the per-request hold, then fund exactly 4 of them.
    await q("SELECT gateway_adjust_credit($1, 10000000, 'topup', null)", [USER]);
    await (await handleGatewayRequest(request(), chatCompletionsFormat, { repo, fetchImpl: fakeFetch(() => openaiStream("x")).impl })).json();
    const hold = Number((await q<{ h: string }>("SELECT hold_microusd AS h FROM gateway_request_logs"))[0].h);
    await db.exec("TRUNCATE gateway_request_logs, gateway_credit_holds, gateway_credit_ledger");
    await q("UPDATE gateway_users SET balance_microusd = $1", [hold * 4]);

    const slow = fakeFetch(async () => {
      await new Promise((r) => setTimeout(r, 20));
      return openaiStream("ok");
    });
    const results = await Promise.all(Array.from({ length: 25 }, () => handleGatewayRequest(request(), chatCompletionsFormat, { repo, fetchImpl: slow.impl })));
    const statuses = results.map((r) => r.status);
    expect(statuses.filter((s) => s === 200)).toHaveLength(4);
    expect(statuses.filter((s) => s === 402)).toHaveLength(21);
    expect(slow.calls).toHaveLength(4); // refused requests never reached a provider
    expect(await balance()).toBe(hold * 4 - 4 * 300);
    expect(await openHolds()).toBe(0);
  });

  it("401 from a provider blocks its credential in the DB and later requests skip it", async () => {
    await q("SELECT gateway_adjust_credit($1, 10000000, 'topup', null)", [USER]);
    await q(`INSERT INTO model_alias_fallbacks (alias_id, priority, provider, provider_model)
             SELECT id, 1, 'gemini', 'gemini-2.5-pro' FROM model_aliases WHERE alias = 'premium-model'`);
    const { impl, calls } = fakeFetch((c) => (c.url.includes("dashscope")
      ? new Response(JSON.stringify({ error: { message: `Incorrect API key ${UPSTREAM_SECRET}-qwen` } }), { status: 401 })
      : openaiStream("from gemini")));

    expect((await handleGatewayRequest(request(), chatCompletionsFormat, { repo, fetchImpl: impl })).status).toBe(200);
    const health = await q("SELECT provider_id, status_code, reason FROM gateway_credential_health");
    expect(health).toHaveLength(1);
    expect(health[0]).toMatchObject({ provider_id: "qwen", status_code: 401 });
    expect(String(health[0].reason)).not.toContain(UPSTREAM_SECRET);

    clearAliasCache(); // simulate a fresh serverless instance reading the block from the DB
    calls.length = 0;
    await handleGatewayRequest(request(), chatCompletionsFormat, { repo, fetchImpl: impl });
    expect(calls.map((c) => new URL(c.url).hostname)).toEqual(["gemini.example"]);

    const logs = await q<{ fallback_used: boolean; attempts: unknown }>("SELECT fallback_used, attempts FROM gateway_request_logs ORDER BY created_at");
    expect(logs.every((l) => l.fallback_used)).toBe(true);
    expect(JSON.stringify(logs)).not.toContain(UPSTREAM_SECRET);
  });

  it("re-routing the alias in the DB switches the backend for the same client request", async () => {
    await q("SELECT gateway_adjust_credit($1, 10000000, 'topup', null)", [USER]);
    const { impl, calls } = fakeFetch(() => openaiStream("ok"));
    await handleGatewayRequest(request(), chatCompletionsFormat, { repo, fetchImpl: impl });
    await q("UPDATE model_aliases SET provider = 'gemini', provider_model = 'gemini-2.5-pro' WHERE alias = 'premium-model'");
    clearAliasCache(); // in production the 10s cache expires (or the admin action clears it)
    await handleGatewayRequest(request(), chatCompletionsFormat, { repo, fetchImpl: impl });
    expect(calls.map((c) => c.body.model)).toEqual(["qwen3.7-flash", "gemini-2.5-pro"]);
    const logs = await q<{ real_model: string; public_model: string }>("SELECT public_model, real_model FROM gateway_request_logs ORDER BY created_at");
    expect(logs).toEqual([
      { public_model: "premium-model", real_model: "qwen/qwen3.7-flash" },
      { public_model: "premium-model", real_model: "gemini/gemini-2.5-pro" },
    ]);
  });

  it("/v1/models data from the DB contains no provider, real model or upstream URL", async () => {
    const list = (await repo.listPublicAliases()).map((a) => toPublicModel(a));
    expect(list).toHaveLength(1);
    expect(list[0]).toMatchObject({ id: "premium-model", display_name: "TokenAPI Pro", capabilities: ["streaming", "tools", "json_output"], context_length: 131072 });
    const s = JSON.stringify(list).toLowerCase();
    for (const leak of ["qwen", "alibaba", "dashscope", "gemini", "provider", "api_base", "sk-"]) expect(s).not.toContain(leak);
  });
});
