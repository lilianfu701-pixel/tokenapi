import { getDb } from "@/lib/db";
import { ok, fail } from "@/lib/api-response";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const sql = getDb();
    const rows = await sql`
      SELECT
        p.id, p.name, p.npm, p.doc, p.api, p.updated_at,
        COUNT(m.id)::int AS model_count
      FROM providers p
      LEFT JOIN models m ON m.provider_id = p.id
      GROUP BY p.id
      ORDER BY model_count DESC, p.name ASC
    `;

    return ok(rows);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return fail("DB_ERROR", msg, 500);
  }
}
