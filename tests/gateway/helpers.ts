import { hashApiKey } from "@/lib/gateway/crypto";
import { credentialRef, type GatewayRepo, type PublicAlias, type ReserveResult, type UsageRecord } from "@/lib/gateway/repo";
import { buildRoutes, modelKey } from "@/lib/gateway/router";
import type { AliasRow, ApiKeyContext, FallbackRow, ModelRow, ProviderCredential, ProviderRow, Route } from "@/lib/gateway/types";

export const TEST_KEY = "sk-tk-test-key";

export function provider(id: string, over: Partial<ProviderRow> = {}): ProviderRow {
  return { id, name: id.toUpperCase(), vendor: "other", adapter: "openai", api_base: `https://${id}.example/v1`, extra_headers: {}, timeout_ms: 2000, enabled: true, ...over };
}

export function model(providerId: string, providerModel: string, over: Partial<ModelRow> = {}): ModelRow {
  return {
    provider_id: providerId, provider_model: providerModel, display_name: providerModel, context_length: 32000,
    max_output_tokens: 1000, capabilities: [], input_price: 1, output_price: 2, cache_read_price: null, enabled: true, ...over,
  };
}

export function alias(over: Partial<AliasRow> = {}): AliasRow {
  return {
    id: "alias-1", alias: "premium-model", display_name: "TokenAPI Pro", description: null,
    provider: "qwen", provider_model: "qwen-max", api_base: null, api_key_id: null,
    price_multiplier: 1.5, public_input_price: null, public_output_price: null, inject_identity: true, enabled: true, ...over,
  };
}

export function fallback(provider: string, providerModel: string, priority: number, over: Partial<FallbackRow> = {}): FallbackRow {
  return { alias_id: "alias-1", priority, provider, provider_model: providerModel, api_base: null, api_key_id: null, enabled: true, ...over };
}

/**
 * In-memory repo. reserveCredit / recordUsage mirror gateway_reserve_credit /
 * gateway_settle_credit: check-and-move happens in one synchronous step (no await in
 * between), which is the JS equivalent of the guarded UPDATE in Postgres.
 */
export class FakeRepo implements GatewayRepo {
  records: UsageRecord[] = [];
  rate = new Map<string, number>();
  providers = new Map<string, ProviderRow>();
  models = new Map<string, ModelRow>();
  aliases: AliasRow[] = [];
  fallbacks: FallbackRow[] = [];
  keyCtx: ApiKeyContext = { keyId: "key-1", userId: "user-1", rpmLimit: 1000, allowedAliases: null };
  providerKeys: Record<string, string | null> = {};
  blocked = new Map<string, number>();
  balance = 10_000_000;
  keySpent = 0;
  keySpendLimit: number | null = null;
  holds = new Map<string, number>();
  constructor(private readonly clock: () => number = Date.now) {}

  addProvider(p: ProviderRow, ...ms: ModelRow[]) {
    this.providers.set(p.id, p);
    for (const m of ms) this.models.set(modelKey(m.provider_id, m.provider_model), m);
    this.providerKeys[p.id] ??= `sk-upstream-secret-${p.id}-0123456789`;
  }

  async authenticate(keyHash: string) {
    return keyHash === hashApiKey(TEST_KEY) ? this.keyCtx : null;
  }
  async resolveAlias(name: string) {
    const a = this.aliases.find((x) => x.alias === name && x.enabled);
    if (!a) return null;
    return buildRoutes(a, this.fallbacks.filter((f) => f.alias_id === a.id), this.providers, this.models);
  }
  async listPublicAliases(): Promise<PublicAlias[]> {
    return this.aliases.filter((a) => a.enabled).map((a) => ({ alias: a, model: this.models.get(modelKey(a.provider, a.provider_model)) ?? null }));
  }
  async getProviderKey(route: Route): Promise<ProviderCredential | null> {
    const secret = this.providerKeys[route.provider.id];
    return secret ? { id: `key-${route.provider.id}`, secret } : null;
  }
  async blockedCredentials() {
    const now = this.clock();
    return new Set([...this.blocked].filter(([, until]) => until > now).map(([k]) => k));
  }
  async blockCredential(providerId: string, keyRef: string, _status: number, _reason: string, untilMs: number) {
    this.blocked.set(credentialRef(providerId, keyRef), untilMs);
  }
  async hitRateLimit(bucket: string, windowStart: number) {
    const k = `${bucket}@${windowStart}`;
    const n = (this.rate.get(k) ?? 0) + 1;
    this.rate.set(k, n);
    return n;
  }
  async reserveCredit(requestId: string, _userId: string, _keyId: string, amount: number): Promise<ReserveResult> {
    await Promise.resolve(); // yield, like a network round-trip, so concurrent calls interleave
    if (this.keySpendLimit != null && this.keySpent + amount > this.keySpendLimit) return "key_spend_limit";
    if (this.balance <= 0 || this.balance < amount) return "insufficient_balance";
    this.balance -= amount;
    this.keySpent += amount;
    this.holds.set(requestId, amount);
    return "ok";
  }
  async recordUsage(rec: UsageRecord) {
    await Promise.resolve();
    this.records.push(rec);
    const hold = this.holds.get(rec.requestId);
    if (hold === undefined) return;
    this.holds.delete(rec.requestId);
    this.balance += hold - rec.customerChargeMicrousd;
    this.keySpent += rec.customerChargeMicrousd - hold;
  }
}

export function sseResponse(events: Array<{ event?: string; data: unknown }>, status = 200) {
  const text = events
    .map((e) => `${e.event ? `event: ${e.event}\n` : ""}data: ${typeof e.data === "string" ? e.data : JSON.stringify(e.data)}\n\n`)
    .join("");
  return new Response(text, { status, headers: { "content-type": "text/event-stream" } });
}

/** OpenAI-compatible upstream stream that says `text` and reports usage. */
export function openaiStream(text: string, usage = { prompt_tokens: 100, completion_tokens: 50, total_tokens: 150 }, upstreamModel = "qwen-max") {
  const half = Math.ceil(text.length / 2);
  return sseResponse([
    { data: { id: "up-1", model: upstreamModel, choices: [{ index: 0, delta: { role: "assistant", content: text.slice(0, half) }, finish_reason: null }] } },
    { data: { id: "up-1", model: upstreamModel, choices: [{ index: 0, delta: { content: text.slice(half) }, finish_reason: "stop" }] } },
    { data: { id: "up-1", model: upstreamModel, choices: [], usage } },
    { data: "[DONE]" },
  ]);
}

export interface FetchCall {
  url: string;
  headers: Record<string, string>;
  body: Record<string, unknown>;
}

export function fakeFetch(handler: (call: FetchCall) => Response | Promise<Response>) {
  const calls: FetchCall[] = [];
  const impl = (async (url: string | URL, init?: RequestInit) => {
    const call = { url: String(url), headers: init?.headers as Record<string, string>, body: JSON.parse(String(init?.body ?? "{}")) };
    calls.push(call);
    return handler(call);
  }) as typeof fetch;
  return { impl, calls };
}

export function gatewayRequest(path: string, body: unknown, headers: Record<string, string> = { authorization: `Bearer ${TEST_KEY}` }) {
  return new Request(`https://api.test${path}`, { method: "POST", headers: { "content-type": "application/json", ...headers }, body: JSON.stringify(body) });
}

export async function readSse(res: Response) {
  const text = await res.text();
  return text
    .split("\n\n")
    .filter(Boolean)
    .map((block) => {
      const event = /^event: (.*)$/m.exec(block)?.[1];
      const data = /^data: (.*)$/m.exec(block)?.[1] ?? "";
      return { event, data: data === "[DONE]" ? data : JSON.parse(data) };
    });
}
