// Seeds the initial gateway routing: providers, real models (official list prices from
// models.dev, 2026-10-02), the four public aliases and their fallback chains.
//
//   node scripts/seed-gateway-routing.mjs            # dry run: prints the plan
//   node scripts/seed-gateway-routing.mjs --apply    # writes to DATABASE_URL (.env.local)
//
// Safe to re-run: providers/models are upserted; aliases (and their fallbacks) are only
// created if missing, so later edits in /admin are never overwritten.
// Aliases are created DISABLED: enable each one in /admin once its provider keys are added.
// No secrets here; upstream API keys are added (encrypted) in /admin/providers.

import { readFileSync } from "node:fs";
import { Pool } from "@neondatabase/serverless";

const MULTIPLIER = 1.3;
const OUTPUT_CAP = 32768; // pre-authorization cap; official limits are 64K-393K

const PROVIDERS = [
  { id: "alibaba", name: "Alibaba", vendor: "alibaba", adapter: "openai", api_base: "https://dashscope-intl.aliyuncs.com/compatible-mode/v1" },
  { id: "deepseek", name: "DeepSeek", vendor: "deepseek", adapter: "openai", api_base: "https://api.deepseek.com" },
  { id: "google", name: "Google", vendor: "google", adapter: "openai", api_base: "https://generativelanguage.googleapis.com/v1beta/openai" },
];

// [provider, model id, display name, context, official max output, input, output, cache read, capabilities]
const MODELS = [
  ["alibaba", "qwen3.8-flash", "Qwen3.8 Flash", 1000000, 131072, 0.15, 0.47, 0.016, ["tools", "vision", "json_output", "reasoning"]],
  ["alibaba", "qwen3.7-plus", "Qwen3.7 Plus", 1000000, 131072, 0.4, 1.6, 0.04, ["tools", "vision", "json_output", "reasoning"]],
  ["alibaba", "qwen3.8-max", "Qwen3.8 Max", 1000000, 131072, 2, 6, 0.25, ["tools", "vision", "json_output", "reasoning"]],
  ["deepseek", "deepseek-flash", "DeepSeek Flash", 1000000, 393216, 0.15, 0.6, 0.003, ["tools", "vision", "json_output", "reasoning"]],
  ["deepseek", "deepseek-v4-pro", "DeepSeek V4 Pro", 1000000, 393216, 0.66, 1.98, 0.022, ["tools", "json_output", "reasoning"]],
  ["google", "gemini-3.5-flash-lite", "Gemini 3.5 Flash Lite", 1048576, 65536, 0.3, 2.5, 0.03, ["tools", "vision", "json_output", "reasoning"]],
  ["google", "gemini-3.8-flash", "Gemini 3.8 Flash", 1048576, 65536, 0.75, 3.75, 0.075, ["tools", "vision", "json_output", "reasoning"]],
];

// alias, display name, description, sort, [primary, ...fallbacks] as "provider/model"
const ALIASES = [
  ["tokenapi-fast", "TokenAPI Fast", "Fast and low-cost for everyday tasks, classification and batch jobs.", 10,
    ["alibaba/qwen3.8-flash", "deepseek/deepseek-flash", "google/gemini-3.5-flash-lite"]],
  ["tokenapi-plus", "TokenAPI Plus", "Balanced quality and price; the default choice for most applications.", 20,
    ["alibaba/qwen3.7-plus", "deepseek/deepseek-v4-pro", "google/gemini-3.8-flash"]],
  ["tokenapi-pro", "TokenAPI Pro", "Flagship quality for complex tasks, coding and long context.", 30,
    ["alibaba/qwen3.8-max", "google/gemini-3.8-flash", "deepseek/deepseek-v4-pro"]],
  ["tokenapi-think", "TokenAPI Think", "Reasoning-first model that thinks before it answers.", 40,
    ["deepseek/deepseek-v4-pro", "alibaba/qwen3.8-max", "google/gemini-3.8-flash"]],
];

const split = (route) => {
  const i = route.indexOf("/");
  return [route.slice(0, i), route.slice(i + 1)];
};

// Sanity: every route points at a seeded model.
const modelKeys = new Set(MODELS.map(([p, m]) => `${p}/${m}`));
for (const [alias, , , , routes] of ALIASES) for (const r of routes) if (!modelKeys.has(r)) throw new Error(`${alias}: unknown route ${r}`);

function printPlan() {
  console.log(`Providers: ${PROVIDERS.map((p) => p.id).join(", ")}`);
  console.log(`Models (${MODELS.length}), output cap ${OUTPUT_CAP}:`);
  for (const [p, m, , , maxOut, inp, out] of MODELS) console.log(`  ${`${p}/${m}`.padEnd(30)} $${inp} / $${out} per 1M   max out ${Math.min(maxOut, OUTPUT_CAP)}`);
  console.log(`Aliases (x${MULTIPLIER}, created disabled):`);
  for (const [alias, name, , , routes] of ALIASES) console.log(`  ${alias.padEnd(15)} ${name.padEnd(15)} ${routes.join("  ->  ")}`);
}

async function apply() {
  const env = Object.fromEntries(
    readFileSync(".env.local", "utf8").split(/\r?\n/).filter((l) => l.includes("=")).map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i), l.slice(i + 1).replace(/^"|"$/g, "")];
    }),
  );
  const pool = new Pool({ connectionString: env.DATABASE_URL });
  const db = await pool.connect();
  const created = [];
  try {
    await db.query("BEGIN");
    for (const p of PROVIDERS) {
      await db.query(
        `INSERT INTO gateway_providers (id, name, vendor, adapter, api_base) VALUES ($1,$2,$3,$4,$5)
         ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, vendor = EXCLUDED.vendor, adapter = EXCLUDED.adapter, updated_at = NOW()`,
        [p.id, p.name, p.vendor, p.adapter, p.api_base],
      );
    }
    for (const [p, m, name, ctx, maxOut, inp, out, cache, caps] of MODELS) {
      await db.query(
        `INSERT INTO gateway_models (provider_id, provider_model, display_name, context_length, max_output_tokens, capabilities, input_price, output_price, cache_read_price)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
         ON CONFLICT (provider_id, provider_model) DO UPDATE SET display_name = EXCLUDED.display_name, context_length = EXCLUDED.context_length,
           capabilities = EXCLUDED.capabilities, input_price = EXCLUDED.input_price, output_price = EXCLUDED.output_price,
           cache_read_price = EXCLUDED.cache_read_price, updated_at = NOW()`,
        [p, m, name, ctx, Math.min(maxOut, OUTPUT_CAP), caps, inp, out, cache],
      );
    }
    for (const [alias, name, desc, sort, routes] of ALIASES) {
      const [pp, pm] = split(routes[0]);
      const ins = await db.query(
        `INSERT INTO model_aliases (alias, display_name, description, provider, provider_model, price_multiplier, inject_identity, enabled, sort_order)
         VALUES ($1,$2,$3,$4,$5,$6,true,false,$7) ON CONFLICT (alias) DO NOTHING RETURNING id`,
        [alias, name, desc, pp, pm, MULTIPLIER, sort],
      );
      if (!ins.rows[0]) continue; // already exists: leave admin edits alone
      const aliasId = ins.rows[0].id;
      for (const [i, route] of routes.slice(1).entries()) {
        const [fp, fm] = split(route);
        await db.query(`INSERT INTO model_alias_fallbacks (alias_id, priority, provider, provider_model) VALUES ($1,$2,$3,$4)`, [aliasId, i + 1, fp, fm]);
      }
      await db.query(
        `INSERT INTO gateway_audit_log (actor, action, entity, entity_id, before, after) VALUES ('seed-script', 'create', 'alias', $1, NULL, $2)`,
        [alias, JSON.stringify({ display_name: name, routes, price_multiplier: MULTIPLIER, enabled: false })],
      );
      created.push(alias);
    }
    await db.query("COMMIT");
    console.log(`\nApplied. New aliases: ${created.length ? created.join(", ") : "none (all existed)"}`);
  } catch (e) {
    await db.query("ROLLBACK").catch(() => {});
    throw e;
  } finally {
    db.release();
    await pool.end();
  }
}

printPlan();
if (process.argv.includes("--apply")) await apply();
else console.log("\nDry run. Re-run with --apply to write.");
