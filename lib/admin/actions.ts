"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { ADAPTER_KINDS } from "@/lib/gateway/adapters";
import { checkBrandUsage } from "@/lib/gateway/brand-guard";
import { encryptSecret, generateApiKey, secretHint } from "@/lib/gateway/crypto";
import { clearAliasCache } from "@/lib/gateway/repo";
import { checkAdminPassword, endAdminSession, requireAdmin, startAdminSession } from "./auth";
import { MODEL_CAPABILITIES } from "@/lib/gateway/types";
import { FormInputError, bool, httpsUrl, num, optStr, routeValue, slug, str, usd, uuidOrNull } from "./form";
import { assertAdminLoginIsAllowed, getLoginAttemptIdentifier, recordFailedAdminLogin, recordSuccessfulAdminLogin } from "./rate-limit";

const VENDORS = ["anthropic", "openai", "google", "alibaba", "deepseek", "moonshot", "other"];

type Sql = ReturnType<typeof getDb>;

function dbMessage(e: unknown) {
  const code = (e as { code?: string })?.code;
  if (code === "23505") return "A record with that id already exists.";
  if (code === "23503") return "Referenced record is missing, or this record is still in use.";
  console.error("[admin] action failed", e);
  return "Operation failed. Check server logs.";
}

/** Auth -> validate -> mutate -> redirect back with ?ok / ?error. */
async function run(path: string, fn: (sql: Sql, actor: string) => Promise<string | void>) {
  const actor = await requireAdmin();
  let message: string;
  try {
    message = (await fn(getDb(), actor)) || "Saved.";
  } catch (e) {
    const msg = e instanceof FormInputError ? e.message : dbMessage(e);
    redirect(`${path}?error=${encodeURIComponent(msg)}`);
  }
  revalidatePath(path);
  redirect(`${path}?ok=${encodeURIComponent(message)}`);
}

async function audit(sql: Sql, actor: string, action: string, entity: string, entityId: string, before: unknown, after: unknown) {
  await sql`INSERT INTO gateway_audit_log (actor, action, entity, entity_id, before, after)
            VALUES (${actor}, ${action}, ${entity}, ${entityId}, ${before ? JSON.stringify(before) : null}, ${after ? JSON.stringify(after) : null})`;
}

// ---------------------------------------------------------------- session

export async function loginAction(form: FormData) {
  const id = getLoginAttemptIdentifier(await headers());
  if (!(await assertAdminLoginIsAllowed(id))) redirect("/admin/login?error=locked");
  if (!checkAdminPassword(str(form, "password", { max: 200 }))) {
    await recordFailedAdminLogin(id);
    redirect("/admin/login?error=invalid");
  }
  await recordSuccessfulAdminLogin(id);
  await startAdminSession();
  redirect("/admin");
}

export async function logoutAction() {
  await endAdminSession();
  redirect("/admin/login");
}

// ---------------------------------------------------------------- providers

export async function saveProvider(form: FormData) {
  await run("/admin/providers", async (sql, actor) => {
    const id = slug(form, "id");
    const vendor = str(form, "vendor", { required: true });
    const adapter = str(form, "adapter", { required: true });
    if (!VENDORS.includes(vendor)) throw new FormInputError("Unknown vendor.");
    if (!ADAPTER_KINDS.includes(adapter as never)) throw new FormInputError("Unknown adapter.");
    let extraHeaders: Record<string, string> = {};
    const rawHeaders = str(form, "extra_headers", { max: 2000 });
    if (rawHeaders) {
      try {
        extraHeaders = JSON.parse(rawHeaders);
      } catch {
        throw new FormInputError("extra_headers must be a JSON object.");
      }
      if (typeof extraHeaders !== "object" || Array.isArray(extraHeaders)) throw new FormInputError("extra_headers must be a JSON object.");
    }
    const after = {
      id,
      name: str(form, "name", { required: true, max: 120 }),
      vendor,
      adapter,
      api_base: httpsUrl(str(form, "api_base", { required: true }), "api_base"),
      extra_headers: extraHeaders,
      timeout_ms: num(form, "timeout_ms", { min: 1000, max: 300000 }) ?? 60000,
      enabled: bool(form, "enabled"),
    };
    const before = (await sql`SELECT * FROM gateway_providers WHERE id = ${id}`)[0] ?? null;
    await sql`
      INSERT INTO gateway_providers (id, name, vendor, adapter, api_base, extra_headers, timeout_ms, enabled)
      VALUES (${id}, ${after.name}, ${vendor}, ${adapter}, ${after.api_base}, ${JSON.stringify(extraHeaders)}, ${after.timeout_ms}, ${after.enabled})
      ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, vendor = EXCLUDED.vendor, adapter = EXCLUDED.adapter,
        api_base = EXCLUDED.api_base, extra_headers = EXCLUDED.extra_headers, timeout_ms = EXCLUDED.timeout_ms,
        enabled = EXCLUDED.enabled, updated_at = NOW()`;
    await audit(sql, actor, before ? "update" : "create", "provider", id, before, after);
    clearAliasCache();
    return `Provider ${id} saved.`;
  });
}

export async function toggleProvider(form: FormData) {
  await run("/admin/providers", async (sql, actor) => {
    const id = slug(form, "id");
    const rows = await sql`UPDATE gateway_providers SET enabled = NOT enabled, updated_at = NOW() WHERE id = ${id} RETURNING enabled`;
    await audit(sql, actor, rows[0]?.enabled ? "enable" : "disable", "provider", id, null, null);
    clearAliasCache();
    return `Provider ${id} ${rows[0]?.enabled ? "enabled" : "disabled"}.`;
  });
}

export async function addProviderKey(form: FormData) {
  await run("/admin/providers", async (sql, actor) => {
    const providerId = slug(form, "provider_id");
    const secret = str(form, "key", { required: true, max: 1000 });
    const label = str(form, "label", { max: 80 }) || "default";
    const isDefault = bool(form, "is_default");
    const ciphertext = encryptSecret(secret);
    const queries = [];
    if (isDefault) queries.push(sql`UPDATE gateway_provider_keys SET is_default = false WHERE provider_id = ${providerId}`);
    queries.push(sql`INSERT INTO gateway_provider_keys (provider_id, label, key_ciphertext, key_hint, is_default)
                     VALUES (${providerId}, ${label}, ${ciphertext}, ${secretHint(secret)}, ${isDefault})`);
    await sql.transaction(queries);
    await audit(sql, actor, "add_key", "provider", providerId, null, { label, hint: secretHint(secret) });
    return `Key added to ${providerId}.`;
  });
}

export async function updateProviderKey(form: FormData) {
  await run("/admin/providers", async (sql, actor) => {
    const id = uuidOrNull(form, "id");
    const op = str(form, "op", { required: true });
    if (!id) throw new FormInputError("id is required.");
    // Any admin action on a key clears its circuit-breaker block.
    await sql`DELETE FROM gateway_credential_health WHERE key_ref = ${id}`;
    if (op === "toggle") await sql`UPDATE gateway_provider_keys SET enabled = NOT enabled WHERE id = ${id}`;
    else if (op === "default") {
      await sql.transaction([
        sql`UPDATE gateway_provider_keys SET is_default = false WHERE provider_id = (SELECT provider_id FROM gateway_provider_keys WHERE id = ${id})`,
        sql`UPDATE gateway_provider_keys SET is_default = true WHERE id = ${id}`,
      ]);
    } else if (op === "delete") await sql`DELETE FROM gateway_provider_keys WHERE id = ${id}`;
    else throw new FormInputError("Unknown operation.");
    await audit(sql, actor, `key_${op}`, "provider_key", id, null, null);
    clearAliasCache();
    return "Key updated.";
  });
}

export async function clearCredentialBlock(form: FormData) {
  await run("/admin/providers", async (sql, actor) => {
    const providerId = slug(form, "provider_id");
    const keyRef = str(form, "key_ref", { required: true, max: 64 });
    await sql`DELETE FROM gateway_credential_health WHERE provider_id = ${providerId} AND key_ref = ${keyRef}`;
    await audit(sql, actor, "unblock_credential", "provider", providerId, null, { keyRef });
    clearAliasCache();
    return `Credential ${keyRef} of ${providerId} unblocked.`;
  });
}

// ---------------------------------------------------------------- models

export async function saveModel(form: FormData) {
  await run("/admin/models", async (sql, actor) => {
    const providerId = slug(form, "provider_id");
    const providerModel = str(form, "provider_model", { required: true, max: 200 });
    const after = {
      display_name: str(form, "display_name", { required: true, max: 120 }),
      context_length: num(form, "context_length", { min: 0, max: 100_000_000 }),
      max_output_tokens: num(form, "max_output_tokens", { min: 1, max: 10_000_000 }),
      capabilities: form.getAll("capabilities").map(String).filter((c) => (MODEL_CAPABILITIES as readonly string[]).includes(c)),
      input_price: num(form, "input_price", { min: 0, max: 100000 }) ?? 0,
      output_price: num(form, "output_price", { min: 0, max: 100000 }) ?? 0,
      cache_read_price: num(form, "cache_read_price", { min: 0, max: 100000 }),
      enabled: bool(form, "enabled"),
    };
    const before = (await sql`SELECT * FROM gateway_models WHERE provider_id = ${providerId} AND provider_model = ${providerModel}`)[0] ?? null;
    await sql`
      INSERT INTO gateway_models (provider_id, provider_model, display_name, context_length, max_output_tokens, capabilities,
        input_price, output_price, cache_read_price, enabled)
      VALUES (${providerId}, ${providerModel}, ${after.display_name}, ${after.context_length}, ${after.max_output_tokens}, ${after.capabilities},
        ${after.input_price}, ${after.output_price}, ${after.cache_read_price}, ${after.enabled})
      ON CONFLICT (provider_id, provider_model) DO UPDATE SET display_name = EXCLUDED.display_name,
        context_length = EXCLUDED.context_length, max_output_tokens = EXCLUDED.max_output_tokens,
        capabilities = EXCLUDED.capabilities, input_price = EXCLUDED.input_price, output_price = EXCLUDED.output_price,
        cache_read_price = EXCLUDED.cache_read_price, enabled = EXCLUDED.enabled, updated_at = NOW()`;
    await audit(sql, actor, before ? "update" : "create", "model", `${providerId}/${providerModel}`, before, after);
    clearAliasCache();
    return `Model ${providerId}/${providerModel} saved.`;
  });
}

export async function toggleModel(form: FormData) {
  await run("/admin/models", async (sql, actor) => {
    const { provider, providerModel } = routeValue(form, "route");
    const rows = await sql`UPDATE gateway_models SET enabled = NOT enabled, updated_at = NOW()
                           WHERE provider_id = ${provider} AND provider_model = ${providerModel} RETURNING enabled`;
    await audit(sql, actor, rows[0]?.enabled ? "enable" : "disable", "model", `${provider}/${providerModel}`, null, null);
    clearAliasCache();
    return "Model updated.";
  });
}

// ---------------------------------------------------------------- aliases

async function vendorOf(sql: Sql, providerId: string) {
  const rows = await sql`SELECT vendor FROM gateway_providers WHERE id = ${providerId}`;
  if (!rows[0]) throw new FormInputError(`Provider ${providerId} does not exist.`);
  return String(rows[0].vendor);
}

async function assertBrandOk(sql: Sql, names: string[], providerIds: string[]) {
  for (const p of new Set(providerIds)) {
    const problem = checkBrandUsage(names, await vendorOf(sql, p));
    if (problem) throw new FormInputError(problem);
  }
}

export async function saveAlias(form: FormData) {
  await run("/admin/aliases", async (sql, actor) => {
    const alias = slug(form, "alias");
    const { provider, providerModel } = routeValue(form, "route");
    const displayName = str(form, "display_name", { required: true, max: 120 });
    const publicIn = num(form, "public_input_price", { min: 0, max: 100000 });
    const publicOut = num(form, "public_output_price", { min: 0, max: 100000 });
    if ((publicIn == null) !== (publicOut == null)) throw new FormInputError("Set both public prices or neither.");
    const apiBase = optStr(form, "api_base");

    const before = (await sql`SELECT * FROM model_aliases WHERE alias = ${alias}`)[0] ?? null;
    const fallbackProviders = before
      ? (await sql`SELECT provider FROM model_alias_fallbacks WHERE alias_id = ${before.id}`).map((r) => String(r.provider))
      : [];
    await assertBrandOk(sql, [alias, displayName], [provider, ...fallbackProviders]);

    const after = {
      alias,
      display_name: displayName,
      description: optStr(form, "description", 1000),
      provider,
      provider_model: providerModel,
      api_base: apiBase ? httpsUrl(apiBase, "api_base") : null,
      api_key_id: uuidOrNull(form, "api_key_id"),
      price_multiplier: num(form, "price_multiplier", { min: 0, max: 1000 }) ?? 1,
      public_input_price: publicIn,
      public_output_price: publicOut,
      inject_identity: bool(form, "inject_identity"),
      enabled: bool(form, "enabled"),
      sort_order: num(form, "sort_order", { min: -10000, max: 10000 }) ?? 0,
    };
    await sql`
      INSERT INTO model_aliases (alias, display_name, description, provider, provider_model, api_base, api_key_id,
        price_multiplier, public_input_price, public_output_price, inject_identity, enabled, sort_order)
      VALUES (${alias}, ${after.display_name}, ${after.description}, ${provider}, ${providerModel}, ${after.api_base}, ${after.api_key_id},
        ${after.price_multiplier}, ${publicIn}, ${publicOut}, ${after.inject_identity}, ${after.enabled}, ${after.sort_order})
      ON CONFLICT (alias) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description,
        provider = EXCLUDED.provider, provider_model = EXCLUDED.provider_model, api_base = EXCLUDED.api_base,
        api_key_id = EXCLUDED.api_key_id, price_multiplier = EXCLUDED.price_multiplier,
        public_input_price = EXCLUDED.public_input_price, public_output_price = EXCLUDED.public_output_price,
        inject_identity = EXCLUDED.inject_identity, enabled = EXCLUDED.enabled, sort_order = EXCLUDED.sort_order, updated_at = NOW()`;
    const rerouted = before && (before.provider !== provider || before.provider_model !== providerModel);
    await audit(sql, actor, before ? (rerouted ? "reroute" : "update") : "create", "alias", alias, before, after);
    clearAliasCache();
    return rerouted ? `${alias} now routes to ${provider}/${providerModel}.` : `Alias ${alias} saved.`;
  });
}

export async function toggleAlias(form: FormData) {
  await run("/admin/aliases", async (sql, actor) => {
    const alias = slug(form, "alias");
    const rows = await sql`UPDATE model_aliases SET enabled = NOT enabled, updated_at = NOW() WHERE alias = ${alias} RETURNING enabled`;
    await audit(sql, actor, rows[0]?.enabled ? "enable" : "disable", "alias", alias, null, null);
    clearAliasCache();
    return `${alias} ${rows[0]?.enabled ? "enabled" : "disabled"}.`;
  });
}

export async function addFallback(form: FormData) {
  await run("/admin/aliases", async (sql, actor) => {
    const aliasId = uuidOrNull(form, "alias_id");
    if (!aliasId) throw new FormInputError("alias_id is required.");
    const { provider, providerModel } = routeValue(form, "route");
    const aliasRow = (await sql`SELECT alias, display_name FROM model_aliases WHERE id = ${aliasId}`)[0];
    if (!aliasRow) throw new FormInputError("Alias not found.");
    await assertBrandOk(sql, [String(aliasRow.alias), String(aliasRow.display_name)], [provider]);
    const priority = num(form, "priority", { min: 1, max: 100 }) ?? 1;
    await sql`INSERT INTO model_alias_fallbacks (alias_id, priority, provider, provider_model, api_key_id)
              VALUES (${aliasId}, ${priority}, ${provider}, ${providerModel}, ${uuidOrNull(form, "api_key_id")})`;
    await audit(sql, actor, "add_fallback", "alias", String(aliasRow.alias), null, { provider, providerModel, priority });
    clearAliasCache();
    return "Fallback added.";
  });
}

export async function updateFallback(form: FormData) {
  await run("/admin/aliases", async (sql, actor) => {
    const id = uuidOrNull(form, "id");
    if (!id) throw new FormInputError("id is required.");
    const op = str(form, "op", { required: true });
    let after: Record<string, unknown> | undefined;
    if (op === "toggle") {
      after = (await sql`UPDATE model_alias_fallbacks SET enabled = NOT enabled WHERE id = ${id} RETURNING *`)[0];
    } else if (op === "priority") {
      const priority = num(form, "priority", { required: true, min: 1, max: 100 });
      after = (await sql`UPDATE model_alias_fallbacks SET priority = ${priority} WHERE id = ${id} RETURNING *`)[0];
    } else throw new FormInputError("Unknown operation.");
    await audit(sql, actor, `fallback_${op}`, "alias_fallback", id, null, after ?? null);
    clearAliasCache();
    return "Fallback updated.";
  });
}

export async function deleteFallback(form: FormData) {
  await run("/admin/aliases", async (sql, actor) => {
    const id = uuidOrNull(form, "id");
    if (!id) throw new FormInputError("id is required.");
    const before = (await sql`DELETE FROM model_alias_fallbacks WHERE id = ${id} RETURNING *`)[0] ?? null;
    await audit(sql, actor, "delete_fallback", "alias_fallback", id, before, null);
    clearAliasCache();
    return "Fallback removed.";
  });
}

// ---------------------------------------------------------------- users, credits, keys

export async function createUser(form: FormData) {
  await run("/admin/users", async (sql, actor) => {
    const email = str(form, "email", { required: true, max: 200 }).toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new FormInputError("Invalid email.");
    const credit = usd(form, "initial_credit_usd") ?? 0;
    const rows = await sql`INSERT INTO gateway_users (email, name, rpm_limit)
                           VALUES (${email}, ${optStr(form, "name", 120)}, ${num(form, "rpm_limit", { min: 1, max: 100000 }) ?? 60})
                           RETURNING id`;
    const id = String(rows[0].id);
    if (credit > 0) await sql`SELECT gateway_adjust_credit(${id}, ${credit}, 'topup', 'initial credit')`;
    await audit(sql, actor, "create", "user", id, null, { email, credit });
    return `User ${email} created.`;
  });
}

export async function adjustCredit(form: FormData) {
  await run("/admin/users", async (sql, actor) => {
    const userId = uuidOrNull(form, "user_id");
    if (!userId) throw new FormInputError("user_id is required.");
    const delta = usd(form, "amount_usd", { required: true, allowNegative: true }) ?? 0;
    if (delta === 0) throw new FormInputError("Amount must not be zero.");
    const note = optStr(form, "note", 300);
    // Atomic in the DB: balance += delta and the ledger row in one statement.
    await sql`SELECT gateway_adjust_credit(${userId}, ${delta}, ${delta > 0 ? "topup" : "adjustment"}, ${note})`;
    await audit(sql, actor, "credit", "user", userId, null, { delta_microusd: delta, note });
    return `Balance adjusted by ${str(form, "amount_usd")} USD.`;
  });
}

export async function updateUser(form: FormData) {
  await run("/admin/users", async (sql, actor) => {
    const userId = uuidOrNull(form, "user_id");
    if (!userId) throw new FormInputError("user_id is required.");
    const rpm = num(form, "rpm_limit", { min: 1, max: 100000 });
    if (rpm != null) await sql`UPDATE gateway_users SET rpm_limit = ${rpm} WHERE id = ${userId}`;
    if (bool(form, "toggle")) await sql`UPDATE gateway_users SET enabled = NOT enabled WHERE id = ${userId}`;
    await audit(sql, actor, "update", "user", userId, null, { rpm, toggled: bool(form, "toggle") });
    return "User updated.";
  });
}

export async function toggleApiKey(form: FormData) {
  await run("/admin/users", async (sql, actor) => {
    const id = uuidOrNull(form, "id");
    if (!id) throw new FormInputError("id is required.");
    const rows = await sql`UPDATE gateway_api_keys SET enabled = NOT enabled WHERE id = ${id} RETURNING enabled`;
    await audit(sql, actor, rows[0]?.enabled ? "enable" : "revoke", "api_key", id, null, null);
    return rows[0]?.enabled ? "Key enabled." : "Key revoked.";
  });
}

export interface CreateKeyState {
  key?: string;
  error?: string;
}

/** Used with useActionState so the plaintext key is shown exactly once and never stored or put in a URL. */
export async function createApiKey(_prev: CreateKeyState, form: FormData): Promise<CreateKeyState> {
  await requireAdmin();
  try {
    const sql = getDb();
    const userId = uuidOrNull(form, "user_id");
    if (!userId) throw new FormInputError("user_id is required.");
    const allowed = str(form, "allowed_aliases", { max: 1000 })
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const spendLimit = usd(form, "spend_limit_usd");
    const expires = str(form, "expires_at", { max: 40 });
    if (expires && Number.isNaN(Date.parse(expires))) throw new FormInputError("expires_at is not a valid date.");
    const { key, hash, prefix } = generateApiKey();
    const rows = await sql`
      INSERT INTO gateway_api_keys (user_id, name, key_hash, key_prefix, rpm_limit, spend_limit_microusd, allowed_aliases, expires_at)
      VALUES (${userId}, ${str(form, "name", { max: 80 }) || "default"}, ${hash}, ${prefix},
              ${num(form, "rpm_limit", { min: 1, max: 100000 })}, ${spendLimit},
              ${allowed.length ? allowed : null}, ${expires || null})
      RETURNING id`;
    await audit(sql, "admin", "create", "api_key", String(rows[0].id), null, { userId, prefix, allowed });
    revalidatePath("/admin/users");
    return { key };
  } catch (e) {
    return { error: e instanceof FormInputError ? e.message : dbMessage(e) };
  }
}
