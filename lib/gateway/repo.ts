import { getDb } from "@/lib/db";
import { decryptSecret } from "./crypto";
import type { ErrorType } from "./errors";
import { buildRoutes, modelKey } from "./router";
import type { AliasRow, ApiKeyContext, FallbackRow, ModelRow, ProviderCredential, ProviderRow, ResolvedAlias, Route } from "./types";

export interface RouteAttempt {
  real_model: string;
  provider: string;
  status: number | null;
  error_type: ErrorType | null;
  error: string | null;
  ms: number;
  skipped?: boolean;
}

export interface UsageRecord {
  requestId: string;
  userId: string;
  apiKeyId: string;
  endpoint: string;
  publicModel: string;
  realModel: string | null;
  provider: string | null;
  providerModel: string | null;
  attempts: RouteAttempt[];
  fallbackUsed: boolean;
  stream: boolean;
  status: "success" | "error" | "client_aborted";
  httpStatus: number;
  errorType: ErrorType | null;
  error: string | null;
  inputTokens: number;
  outputTokens: number;
  cachedTokens: number;
  usageEstimated: boolean;
  upstreamCostMicrousd: number;
  customerChargeMicrousd: number;
  holdMicrousd: number;
  priceMultiplier: number | null;
  latencyMs: number;
  ttftMs: number | null;
  clientIp: string | null;
  userAgent: string | null;
}

export interface PublicAlias {
  alias: AliasRow;
  model: ModelRow | null;
}

export type ReserveResult = "ok" | "insufficient_balance" | "key_spend_limit";

export interface GatewayRepo {
  authenticate(keyHash: string): Promise<ApiKeyContext | null>;
  resolveAlias(alias: string): Promise<ResolvedAlias | null>;
  listPublicAliases(): Promise<PublicAlias[]>;
  getProviderKey(route: Route): Promise<ProviderCredential | null>;
  /** "providerId:keyRef" entries currently blocked by the circuit breaker. */
  blockedCredentials(): Promise<Set<string>>;
  blockCredential(providerId: string, keyRef: string, status: number, reason: string, untilMs: number): Promise<void>;
  /** Increments and returns the request count of this fixed window. */
  hitRateLimit(bucket: string, windowStartMs: number): Promise<number>;
  /** Atomically moves `amount` from the balance into a hold (DB-side check, no read-modify-write). */
  reserveCredit(requestId: string, userId: string, apiKeyId: string, amount: number): Promise<ReserveResult>;
  /** Writes the log row and settles the hold with the real charge, in one transaction. */
  recordUsage(rec: UsageRecord): Promise<void>;
}

export const credentialRef = (providerId: string, keyRef: string) => `${providerId}:${keyRef}`;

// ---------------------------------------------------------------- row mapping (NUMERIC arrives as string)

const num = (v: unknown) => (v == null ? null : Number(v));

export function mapProvider(r: Record<string, unknown>): ProviderRow {
  return {
    id: String(r.id),
    name: String(r.name),
    vendor: String(r.vendor ?? "other"),
    adapter: (r.adapter as ProviderRow["adapter"]) ?? "openai",
    api_base: String(r.api_base),
    extra_headers: (r.extra_headers as Record<string, string>) ?? {},
    timeout_ms: Number(r.timeout_ms ?? 60000),
    enabled: Boolean(r.enabled),
  };
}

export function mapModel(r: Record<string, unknown>): ModelRow {
  return {
    provider_id: String(r.provider_id),
    provider_model: String(r.provider_model),
    display_name: String(r.display_name),
    context_length: num(r.context_length),
    max_output_tokens: num(r.max_output_tokens),
    capabilities: Array.isArray(r.capabilities) ? (r.capabilities as string[]) : [],
    input_price: Number(r.input_price ?? 0),
    output_price: Number(r.output_price ?? 0),
    cache_read_price: num(r.cache_read_price),
    enabled: Boolean(r.enabled),
  };
}

export function mapAlias(r: Record<string, unknown>): AliasRow {
  return {
    id: String(r.id),
    alias: String(r.alias),
    display_name: String(r.display_name),
    description: (r.description as string) ?? null,
    provider: String(r.provider),
    provider_model: String(r.provider_model),
    api_base: (r.api_base as string) || null,
    api_key_id: (r.api_key_id as string) || null,
    price_multiplier: Number(r.price_multiplier ?? 1),
    public_input_price: num(r.public_input_price),
    public_output_price: num(r.public_output_price),
    inject_identity: r.inject_identity !== false,
    enabled: Boolean(r.enabled),
  };
}

function mapFallback(r: Record<string, unknown>): FallbackRow {
  return {
    alias_id: String(r.alias_id),
    priority: Number(r.priority ?? 1),
    provider: String(r.provider),
    provider_model: String(r.provider_model),
    api_base: (r.api_base as string) || null,
    api_key_id: (r.api_key_id as string) || null,
    enabled: Boolean(r.enabled),
  };
}

// ---------------------------------------------------------------- caches (per serverless instance)

const CACHE_TTL_MS = 10_000;
const HOLD_SWEEP_PROBABILITY = 0.01;
const aliasCache = new Map<string, { at: number; value: ResolvedAlias | null }>();
let blockedCache: { at: number; value: Set<string> } | null = null;

export function clearAliasCache() {
  aliasCache.clear();
  blockedCache = null;
}

// ---------------------------------------------------------------- Postgres implementation

export type Sql = ReturnType<typeof getDb>;

export function createNeonRepo(sql: Sql = getDb()): GatewayRepo {
  return {
    async authenticate(keyHash) {
      const rows = await sql`
        SELECT k.id AS key_id, k.user_id, k.rpm_limit AS key_rpm, k.allowed_aliases, u.rpm_limit AS user_rpm
        FROM gateway_api_keys k
        JOIN gateway_users u ON u.id = k.user_id
        WHERE k.key_hash = ${keyHash}
          AND k.enabled AND u.enabled
          AND (k.expires_at IS NULL OR k.expires_at > NOW())
        LIMIT 1`;
      const r = rows[0];
      if (!r) return null;
      return {
        keyId: String(r.key_id),
        userId: String(r.user_id),
        rpmLimit: Number(r.key_rpm ?? r.user_rpm ?? 60),
        allowedAliases: (r.allowed_aliases as string[] | null) ?? null,
      };
    },

    async resolveAlias(name) {
      const cached = aliasCache.get(name);
      if (cached && Date.now() - cached.at < CACHE_TTL_MS) return cached.value;

      const aliasRows = await sql`SELECT * FROM model_aliases WHERE alias = ${name} AND enabled LIMIT 1`;
      let value: ResolvedAlias | null = null;
      if (aliasRows[0]) {
        const alias = mapAlias(aliasRows[0]);
        const fallbacks = (await sql`SELECT * FROM model_alias_fallbacks WHERE alias_id = ${alias.id} ORDER BY priority`).map(mapFallback);
        const providerIds = [...new Set([alias.provider, ...fallbacks.map((f) => f.provider)])];
        const [providerRows, modelRows] = await Promise.all([
          sql`SELECT * FROM gateway_providers WHERE id = ANY(${providerIds})`,
          sql`SELECT * FROM gateway_models WHERE provider_id = ANY(${providerIds})`,
        ]);
        const providers = new Map(providerRows.map((r) => [String(r.id), mapProvider(r)]));
        const models = new Map(modelRows.map((r) => { const m = mapModel(r); return [modelKey(m.provider_id, m.provider_model), m]; }));
        value = buildRoutes(alias, fallbacks, providers, models);
      }
      aliasCache.set(name, { at: Date.now(), value });
      return value;
    },

    async listPublicAliases() {
      const rows = await sql`
        SELECT a.*, row_to_json(m.*) AS model_json
        FROM model_aliases a
        LEFT JOIN gateway_models m ON m.provider_id = a.provider AND m.provider_model = a.provider_model
        WHERE a.enabled
        ORDER BY a.sort_order, a.alias`;
      return rows.map((r) => ({ alias: mapAlias(r), model: r.model_json ? mapModel(r.model_json as Record<string, unknown>) : null }));
    },

    async getProviderKey(route) {
      const rows = route.apiKeyId
        ? await sql`SELECT id, key_ciphertext FROM gateway_provider_keys WHERE id = ${route.apiKeyId} AND enabled LIMIT 1`
        : await sql`
            SELECT id, key_ciphertext FROM gateway_provider_keys
            WHERE provider_id = ${route.provider.id} AND enabled
            ORDER BY is_default DESC, created_at ASC LIMIT 1`;
      if (rows[0]) return { id: String(rows[0].id), secret: decryptSecret(String(rows[0].key_ciphertext)) };
      // Optional env fallback: PROVIDER_KEY_QWEN, PROVIDER_KEY_DEEPSEEK, ...
      const env = process.env[`PROVIDER_KEY_${route.provider.id.toUpperCase().replace(/[^A-Z0-9]/g, "_")}`];
      return env ? { id: "env", secret: env } : null;
    },

    async blockedCredentials() {
      if (blockedCache && Date.now() - blockedCache.at < CACHE_TTL_MS) return blockedCache.value;
      const rows = await sql`SELECT provider_id, key_ref FROM gateway_credential_health WHERE blocked_until > NOW()`;
      const value = new Set(rows.map((r) => credentialRef(String(r.provider_id), String(r.key_ref))));
      blockedCache = { at: Date.now(), value };
      return value;
    },

    async blockCredential(providerId, keyRef, status, reason, untilMs) {
      const until = new Date(untilMs).toISOString();
      await sql`
        INSERT INTO gateway_credential_health (provider_id, key_ref, blocked_until, status_code, reason, updated_at)
        VALUES (${providerId}, ${keyRef}, ${until}, ${status}, ${reason.slice(0, 500)}, NOW())
        ON CONFLICT (provider_id, key_ref) DO UPDATE SET blocked_until = EXCLUDED.blocked_until,
          status_code = EXCLUDED.status_code, reason = EXCLUDED.reason, updated_at = NOW()`;
      blockedCache?.value.add(credentialRef(providerId, keyRef));
    },

    async hitRateLimit(bucket, windowStartMs) {
      const windowStart = new Date(windowStartMs).toISOString();
      const rows = await sql`
        INSERT INTO gateway_rate_limits (bucket, window_start, count)
        VALUES (${bucket}, ${windowStart}, 1)
        ON CONFLICT (bucket, window_start) DO UPDATE SET count = gateway_rate_limits.count + 1
        RETURNING count`;
      if (Math.random() < HOLD_SWEEP_PROBABILITY) {
        await sql`DELETE FROM gateway_rate_limits WHERE window_start < NOW() - INTERVAL '1 hour'`;
      }
      return Number(rows[0]?.count ?? 1);
    },

    async reserveCredit(requestId, userId, apiKeyId, amount) {
      if (Math.random() < HOLD_SWEEP_PROBABILITY) await sql`SELECT gateway_release_expired_holds()`;
      const rows = await sql`SELECT gateway_reserve_credit(${requestId}, ${userId}, ${apiKeyId}, ${amount}) AS result`;
      return String(rows[0]?.result) as ReserveResult;
    },

    async recordUsage(rec) {
      await sql.transaction([
        sql`
          INSERT INTO gateway_request_logs (
            id, user_id, api_key_id, endpoint, public_model, real_model, provider, provider_model,
            attempts, fallback_used, stream, status, http_status, error_type, error,
            input_tokens, output_tokens, cached_tokens, usage_estimated,
            upstream_cost_microusd, customer_charge_microusd, hold_microusd, price_multiplier,
            latency_ms, ttft_ms, client_ip, user_agent
          ) VALUES (
            ${rec.requestId}, ${rec.userId}, ${rec.apiKeyId}, ${rec.endpoint}, ${rec.publicModel}, ${rec.realModel},
            ${rec.provider}, ${rec.providerModel}, ${JSON.stringify(rec.attempts)}, ${rec.fallbackUsed}, ${rec.stream},
            ${rec.status}, ${rec.httpStatus}, ${rec.errorType}, ${rec.error},
            ${rec.inputTokens}, ${rec.outputTokens}, ${rec.cachedTokens}, ${rec.usageEstimated},
            ${rec.upstreamCostMicrousd}, ${rec.customerChargeMicrousd}, ${rec.holdMicrousd}, ${rec.priceMultiplier},
            ${rec.latencyMs}, ${rec.ttftMs}, ${rec.clientIp}, ${rec.userAgent}
          )`,
        sql`SELECT gateway_settle_credit(${rec.requestId}, ${rec.customerChargeMicrousd})`,
      ]);
    },
  };
}
