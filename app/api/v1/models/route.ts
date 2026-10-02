import { getDb } from "@/lib/db";
import { paginated, fail } from "@/lib/api-response";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));
  const limit = Math.min(
    200,
    Math.max(1, parseInt(url.searchParams.get("limit") || "50", 10)),
  );
  const offset = (page - 1) * limit;

  const provider = url.searchParams.get("provider");
  const reasoning = url.searchParams.get("reasoning");
  const toolCall = url.searchParams.get("tool_call");
  const attachment = url.searchParams.get("attachment");
  const openWeights = url.searchParams.get("open_weights");
  const family = url.searchParams.get("family");
  const minContext = url.searchParams.get("min_context");
  const maxCostInput = url.searchParams.get("max_cost_input");
  const sort = url.searchParams.get("sort") || "provider_id";
  const order = url.searchParams.get("order") === "desc" ? "DESC" : "ASC";

  const allowedSorts = [
    "provider_id",
    "id",
    "name",
    "cost_input",
    "cost_output",
    "context_limit",
    "release_date",
  ];
  if (!allowedSorts.includes(sort)) {
    return fail("INVALID_SORT", `sort must be one of: ${allowedSorts.join(", ")}`);
  }

  const conditions: string[] = [];
  const params: unknown[] = [];
  let paramIdx = 1;

  if (provider) {
    conditions.push(`provider_id = $${paramIdx++}`);
    params.push(provider);
  }
  if (reasoning === "true") conditions.push("reasoning = true");
  if (reasoning === "false") conditions.push("reasoning = false");
  if (toolCall === "true") conditions.push("tool_call = true");
  if (attachment === "true") conditions.push("attachment = true");
  if (openWeights === "true") conditions.push("open_weights = true");
  if (family) {
    conditions.push(`family = $${paramIdx++}`);
    params.push(family);
  }
  if (minContext) {
    conditions.push(`context_limit >= $${paramIdx++}`);
    params.push(parseInt(minContext, 10));
  }
  if (maxCostInput) {
    conditions.push(`cost_input <= $${paramIdx++}`);
    params.push(parseFloat(maxCostInput));
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  try {
    const sql = getDb();

    const countResult = await sql.query(
      `SELECT COUNT(*)::int AS total FROM models ${where}`,
      params,
    );
    const total: number = countResult[0].total;

    const rows = await sql.query(
      `SELECT
        id, provider_id, name, description, family, type,
        attachment, reasoning, tool_call, structured_output,
        open_weights, knowledge, release_date, last_updated,
        context_limit, input_limit, output_limit,
        input_modalities, output_modalities,
        cost_input, cost_output, cost_reasoning,
        cost_cache_read, cost_cache_write,
        canonical_model_id, status
      FROM models ${where}
      ORDER BY ${sort} ${order}
      LIMIT $${paramIdx++} OFFSET $${paramIdx++}`,
      [...params, limit, offset],
    );

    return paginated(rows, total, page, limit);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return fail("DB_ERROR", msg, 500);
  }
}
