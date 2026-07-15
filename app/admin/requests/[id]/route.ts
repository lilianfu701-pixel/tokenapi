import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "../admin-auth";
import { normalizeAdminNotes, validateReviewStatus } from "../request-review";

type UpdateRequestContext = {
  params: Promise<{
    id: string;
  }>;
};

function getDatabase() {
  const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not configured.");
  }

  return neon(databaseUrl);
}

function parseRequestId(value: string) {
  return /^\d+$/.test(value) ? value : null;
}

export async function POST(request: Request, context: UpdateRequestContext) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.redirect(new URL("/admin/requests", request.url), 303);
  }

  const { id } = await context.params;
  const requestId = parseRequestId(id);
  const formData = await request.formData();
  const reviewStatus = validateReviewStatus(formData.get("review_status"));
  const adminNotes = normalizeAdminNotes(formData.get("admin_notes"));

  if (!requestId || !reviewStatus || adminNotes === null) {
    return NextResponse.redirect(new URL("/admin/requests/list?error=invalid-review", request.url), 303);
  }

  const sql = getDatabase();

  await sql`
    UPDATE access_requests
    SET review_status = ${reviewStatus},
        admin_notes = ${adminNotes},
        reviewed_at = now()
    WHERE id = ${requestId}
  `;

  return NextResponse.redirect(new URL("/admin/requests/list?updated=1", request.url), 303);
}
