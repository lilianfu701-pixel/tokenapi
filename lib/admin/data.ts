import { getDb } from "@/lib/db";
import { requireAdmin } from "./auth";

// Read-side queries for admin pages. Numeric columns arrive as strings from Neon.
// Each query re-checks the session: layouts do not re-run on client-side navigation.

export type Row = Record<string, unknown>;

export async function listProviders() {
  await requireAdmin();
  const sql = getDb();
  const [providers, keys, health] = await Promise.all([
    sql`SELECT p.*, (SELECT COUNT(*)::int FROM gateway_models m WHERE m.provider_id = p.id) AS model_count
        FROM gateway_providers p ORDER BY p.id`,
    sql`SELECT id, provider_id, label, key_hint, is_default, enabled, created_at FROM gateway_provider_keys ORDER BY provider_id, created_at`,
    sql`SELECT * FROM gateway_credential_health WHERE blocked_until > NOW() ORDER BY provider_id`,
  ]);
  return { providers, keys, health };
}

export async function listModels() {
  await requireAdmin();
  return getDb()`
    SELECT m.*, p.name AS provider_name, p.vendor
    FROM gateway_models m JOIN gateway_providers p ON p.id = m.provider_id
    ORDER BY m.provider_id, m.provider_model`;
}

export async function listAliases() {
  await requireAdmin();
  const sql = getDb();
  const [aliases, fallbacks] = await Promise.all([
    sql`SELECT a.*, m.display_name AS model_display_name, m.enabled AS model_enabled, p.enabled AS provider_enabled, p.vendor
        FROM model_aliases a
        LEFT JOIN gateway_models m ON m.provider_id = a.provider AND m.provider_model = a.provider_model
        LEFT JOIN gateway_providers p ON p.id = a.provider
        ORDER BY a.sort_order, a.alias`,
    sql`SELECT * FROM model_alias_fallbacks ORDER BY alias_id, priority`,
  ]);
  return { aliases, fallbacks };
}

export async function listUsers() {
  await requireAdmin();
  const sql = getDb();
  const [users, keys] = await Promise.all([
    sql`SELECT u.*,
          (SELECT COALESCE(SUM(customer_charge_microusd),0)::bigint FROM gateway_request_logs l WHERE l.user_id = u.id AND l.created_at > NOW() - INTERVAL '30 days') AS spend_30d
        FROM gateway_users u ORDER BY u.created_at DESC LIMIT 500`,
    sql`SELECT id, user_id, name, key_prefix, rpm_limit, spend_limit_microusd, spent_microusd, allowed_aliases, enabled, expires_at, last_used_at, created_at
        FROM gateway_api_keys ORDER BY created_at DESC`,
  ]);
  return { users, keys };
}

export interface LogFilters {
  publicModel?: string;
  provider?: string;
  status?: string;
  userEmail?: string;
  page: number;
}

export const LOG_PAGE_SIZE = 50;

export async function listLogs(f: LogFilters) {
  await requireAdmin();
  const sql = getDb();
  const where: string[] = [];
  const params: unknown[] = [];
  const add = (clause: string, value: unknown) => {
    params.push(value);
    where.push(clause.replace("?", `$${params.length}`));
  };
  if (f.publicModel) add("l.public_model = ?", f.publicModel);
  if (f.provider) add("l.provider = ?", f.provider);
  if (f.status) add("l.status = ?", f.status);
  if (f.userEmail) add("u.email = ?", f.userEmail.toLowerCase());
  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
  params.push(LOG_PAGE_SIZE + 1, (f.page - 1) * LOG_PAGE_SIZE);
  const rows = await sql.query(
    `SELECT l.*, u.email AS user_email FROM gateway_request_logs l
     LEFT JOIN gateway_users u ON u.id = l.user_id
     ${whereSql}
     ORDER BY l.created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params,
  );
  return { rows: rows.slice(0, LOG_PAGE_SIZE), hasMore: rows.length > LOG_PAGE_SIZE };
}

export async function dashboardStats() {
  await requireAdmin();
  const sql = getDb();
  const [totals, byAlias, byProvider] = await Promise.all([
    sql`SELECT COUNT(*)::int AS requests,
               COUNT(*) FILTER (WHERE status = 'success')::int AS ok,
               COALESCE(SUM(input_tokens + output_tokens),0)::bigint AS tokens,
               COALESCE(SUM(upstream_cost_microusd),0)::bigint AS cost,
               COALESCE(SUM(customer_charge_microusd),0)::bigint AS charge,
               COUNT(*) FILTER (WHERE fallback_used)::int AS fallbacks,
               COUNT(*) FILTER (WHERE error_type = 'provider_config')::int AS config_errors
        FROM gateway_request_logs WHERE created_at > NOW() - INTERVAL '24 hours'`,
    sql`SELECT public_model, COUNT(*)::int AS requests, COALESCE(SUM(customer_charge_microusd),0)::bigint AS charge
        FROM gateway_request_logs WHERE created_at > NOW() - INTERVAL '24 hours'
        GROUP BY public_model ORDER BY requests DESC LIMIT 10`,
    sql`SELECT provider, COUNT(*)::int AS requests,
               COUNT(*) FILTER (WHERE status = 'success')::int AS ok,
               COALESCE(AVG(ttft_ms),0)::int AS avg_ttft
        FROM gateway_request_logs WHERE created_at > NOW() - INTERVAL '24 hours' AND provider IS NOT NULL
        GROUP BY provider ORDER BY requests DESC`,
  ]);
  return { totals: totals[0], byAlias, byProvider };
}

export async function listAudit(limit = 200) {
  await requireAdmin();
  return getDb()`SELECT * FROM gateway_audit_log ORDER BY created_at DESC LIMIT ${limit}`;
}
