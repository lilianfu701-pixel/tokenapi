import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

const MODELS_DEV_URL =
  process.env.MODELS_DEV_API || "https://models.dev/api.json";

interface ModelsDevModel {
  id?: string;
  name?: string;
  description?: string;
  family?: string;
  type?: string;
  attachment?: boolean;
  reasoning?: boolean;
  reasoning_options?: unknown;
  tool_call?: boolean;
  structured_output?: boolean;
  temperature?: boolean;
  interleaved?: unknown;
  knowledge?: string;
  release_date?: string;
  last_updated?: string;
  open_weights?: boolean;
  modalities?: { input?: string[]; output?: string[] };
  limit?: { context?: number; input?: number; output?: number };
  cost?: {
    input?: number;
    output?: number;
    reasoning?: number;
    cache_read?: number;
    cache_write?: number;
    input_audio?: number;
    output_audio?: number;
  };
  canonical_model_id?: string;
  status?: string;
}

interface ModelsDevProvider {
  id?: string;
  name?: string;
  npm?: string;
  env?: string[];
  doc?: string;
  api?: string;
  models?: Record<string, ModelsDevModel>;
}

export async function POST(request: Request) {
  const secret = request.headers.get("x-sync-secret");
  const expected = process.env.SYNC_SECRET;
  if (expected && secret !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const res = await fetch(MODELS_DEV_URL, { cache: "no-store" });
  if (!res.ok) {
    return NextResponse.json(
      { error: `Failed to fetch models.dev: ${res.status}` },
      { status: 502 },
    );
  }

  const data: Record<string, ModelsDevProvider> = await res.json();
  const sql = getDb();

  let providerCount = 0;
  let modelCount = 0;

  for (const [providerId, provider] of Object.entries(data)) {
    if (!provider || typeof provider !== "object") continue;

    const name = provider.name || providerId;

    await sql`
      INSERT INTO providers (id, name, npm, env, doc, api, source, updated_at)
      VALUES (
        ${providerId},
        ${name},
        ${provider.npm ?? null},
        ${provider.env ?? null},
        ${provider.doc ?? null},
        ${provider.api ?? null},
        'models.dev',
        NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        npm = EXCLUDED.npm,
        env = EXCLUDED.env,
        doc = EXCLUDED.doc,
        api = EXCLUDED.api,
        updated_at = NOW()
    `;
    providerCount++;

    const models = provider.models;
    if (!models || typeof models !== "object") continue;

    for (const [modelId, model] of Object.entries(models)) {
      if (!model || typeof model !== "object") continue;

      const modelName = model.name || modelId;
      const cost = model.cost;
      const limit = model.limit;
      const modalities = model.modalities;

      await sql`
        INSERT INTO models (
          id, provider_id, name, description, family, type,
          attachment, reasoning, reasoning_options, tool_call,
          structured_output, temperature, interleaved,
          knowledge, release_date, last_updated, open_weights,
          context_limit, input_limit, output_limit,
          input_modalities, output_modalities,
          cost_input, cost_output, cost_reasoning,
          cost_cache_read, cost_cache_write,
          cost_input_audio, cost_output_audio,
          canonical_model_id, status, source, raw_data, synced_at
        )
        VALUES (
          ${modelId}, ${providerId}, ${modelName},
          ${model.description ?? null},
          ${model.family ?? null},
          ${model.type ?? null},
          ${model.attachment ?? false},
          ${model.reasoning ?? false},
          ${model.reasoning_options ? JSON.stringify(model.reasoning_options) : null},
          ${model.tool_call ?? false},
          ${model.structured_output ?? null},
          ${model.temperature ?? null},
          ${model.interleaved ? JSON.stringify(model.interleaved) : null},
          ${model.knowledge ?? null},
          ${model.release_date ?? null},
          ${model.last_updated ?? null},
          ${model.open_weights ?? false},
          ${limit?.context ?? null},
          ${limit?.input ?? null},
          ${limit?.output ?? null},
          ${modalities?.input ?? null},
          ${modalities?.output ?? null},
          ${cost?.input ?? null},
          ${cost?.output ?? null},
          ${cost?.reasoning ?? null},
          ${cost?.cache_read ?? null},
          ${cost?.cache_write ?? null},
          ${cost?.input_audio ?? null},
          ${cost?.output_audio ?? null},
          ${model.canonical_model_id ?? null},
          ${model.status ?? null},
          'models.dev',
          ${JSON.stringify(model)},
          NOW()
        )
        ON CONFLICT (provider_id, id) DO UPDATE SET
          name = EXCLUDED.name,
          description = EXCLUDED.description,
          family = EXCLUDED.family,
          type = EXCLUDED.type,
          attachment = EXCLUDED.attachment,
          reasoning = EXCLUDED.reasoning,
          reasoning_options = EXCLUDED.reasoning_options,
          tool_call = EXCLUDED.tool_call,
          structured_output = EXCLUDED.structured_output,
          temperature = EXCLUDED.temperature,
          interleaved = EXCLUDED.interleaved,
          knowledge = EXCLUDED.knowledge,
          release_date = EXCLUDED.release_date,
          last_updated = EXCLUDED.last_updated,
          open_weights = EXCLUDED.open_weights,
          context_limit = EXCLUDED.context_limit,
          input_limit = EXCLUDED.input_limit,
          output_limit = EXCLUDED.output_limit,
          input_modalities = EXCLUDED.input_modalities,
          output_modalities = EXCLUDED.output_modalities,
          cost_input = EXCLUDED.cost_input,
          cost_output = EXCLUDED.cost_output,
          cost_reasoning = EXCLUDED.cost_reasoning,
          cost_cache_read = EXCLUDED.cost_cache_read,
          cost_cache_write = EXCLUDED.cost_cache_write,
          cost_input_audio = EXCLUDED.cost_input_audio,
          cost_output_audio = EXCLUDED.cost_output_audio,
          canonical_model_id = EXCLUDED.canonical_model_id,
          status = EXCLUDED.status,
          raw_data = EXCLUDED.raw_data,
          synced_at = NOW()
      `;
      modelCount++;
    }
  }

  return NextResponse.json({
    success: true,
    synced: { providers: providerCount, models: modelCount },
    timestamp: new Date().toISOString(),
  });
}
