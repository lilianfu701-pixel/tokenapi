import { getDb } from "@/lib/db";
import { ok, fail } from "@/lib/api-response";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ provider: string; id: string }> },
) {
  const { provider, id } = await params;

  try {
    const sql = getDb();
    const rows = await sql`
      SELECT
        m.*,
        p.name AS provider_name,
        p.npm AS provider_npm,
        p.doc AS provider_doc,
        p.api AS provider_api
      FROM models m
      JOIN providers p ON p.id = m.provider_id
      WHERE m.provider_id = ${provider} AND m.id = ${id}
    `;

    if (rows.length === 0) {
      return fail("NOT_FOUND", `Model ${provider}/${id} not found`, 404);
    }

    return ok(rows[0]);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return fail("DB_ERROR", msg, 500);
  }
}
