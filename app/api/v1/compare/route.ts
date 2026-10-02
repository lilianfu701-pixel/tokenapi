import { getDb } from "@/lib/db";
import { ok, fail } from "@/lib/api-response";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const idsParam = url.searchParams.get("ids");

  if (!idsParam) {
    return fail(
      "MISSING_PARAM",
      "ids parameter required (comma-separated, e.g. ?ids=openai/gpt-5,anthropic/claude-opus-4-6)",
    );
  }

  const pairs = idsParam.split(",").map((s) => s.trim());
  if (pairs.length < 2 || pairs.length > 10) {
    return fail("INVALID_PARAM", "Provide 2-10 model IDs to compare");
  }

  const conditions: string[] = [];
  const params: unknown[] = [];

  for (let i = 0; i < pairs.length; i++) {
    const slash = pairs[i].indexOf("/");
    if (slash === -1) {
      return fail(
        "INVALID_FORMAT",
        `Each id must be provider/model, got: ${pairs[i]}`,
      );
    }
    const provider = pairs[i].slice(0, slash);
    const model = pairs[i].slice(slash + 1);
    conditions.push(`(provider_id = $${i * 2 + 1} AND id = $${i * 2 + 2})`);
    params.push(provider, model);
  }

  try {
    const sql = getDb();
    const rows = await sql.query(
      `SELECT
        id, provider_id, name, description, family, type,
        attachment, reasoning, tool_call, structured_output,
        open_weights, knowledge, release_date,
        context_limit, input_limit, output_limit,
        input_modalities, output_modalities,
        cost_input, cost_output, cost_reasoning,
        cost_cache_read, cost_cache_write,
        canonical_model_id, status
      FROM models
      WHERE ${conditions.join(" OR ")}`,
      params,
    );

    return ok(rows);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return fail("DB_ERROR", msg, 500);
  }
}
