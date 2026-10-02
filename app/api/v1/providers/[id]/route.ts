import { getDb } from "@/lib/db";
import { ok, fail } from "@/lib/api-response";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const sql = getDb();

    const providerRows = await sql`
      SELECT id, name, npm, env, doc, api, updated_at
      FROM providers WHERE id = ${id}
    `;

    if (providerRows.length === 0) {
      return fail("NOT_FOUND", `Provider ${id} not found`, 404);
    }

    const modelRows = await sql`
      SELECT
        id, name, description, family, type,
        attachment, reasoning, tool_call, structured_output,
        open_weights, knowledge, release_date,
        context_limit, input_limit, output_limit,
        input_modalities, output_modalities,
        cost_input, cost_output, cost_reasoning,
        cost_cache_read, cost_cache_write,
        canonical_model_id, status
      FROM models
      WHERE provider_id = ${id}
      ORDER BY name ASC
    `;

    return ok({
      ...providerRows[0],
      models: modelRows,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return fail("DB_ERROR", msg, 500);
  }
}
