import { getDb } from "@/lib/db";
import { paginated, fail } from "@/lib/api-response";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const q = url.searchParams.get("q")?.trim();
  const capability = url.searchParams.get("capability");
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));
  const limit = Math.min(
    100,
    Math.max(1, parseInt(url.searchParams.get("limit") || "20", 10)),
  );
  const offset = (page - 1) * limit;

  if (!q && !capability) {
    return fail("MISSING_PARAM", "q or capability parameter required");
  }

  const conditions: string[] = [];
  const params: unknown[] = [];
  let paramIdx = 1;

  if (q) {
    const pattern = `%${q}%`;
    conditions.push(
      `(name ILIKE $${paramIdx} OR id ILIKE $${paramIdx} OR description ILIKE $${paramIdx} OR family ILIKE $${paramIdx} OR provider_id ILIKE $${paramIdx})`,
    );
    params.push(pattern);
    paramIdx++;
  }

  if (capability) {
    const caps = capability.split(",").map((c) => c.trim());
    for (const cap of caps) {
      if (["reasoning", "tool_call", "attachment", "structured_output", "open_weights"].includes(cap)) {
        conditions.push(`${cap} = true`);
      }
    }
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
        id, provider_id, name, description, family,
        attachment, reasoning, tool_call, structured_output,
        open_weights, context_limit, cost_input, cost_output,
        canonical_model_id, status
      FROM models ${where}
      ORDER BY name ASC
      LIMIT $${paramIdx++} OFFSET $${paramIdx++}`,
      [...params, limit, offset],
    );

    return paginated(rows, total, page, limit);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return fail("DB_ERROR", msg, 500);
  }
}
