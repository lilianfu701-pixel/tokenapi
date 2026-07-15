import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "../admin-auth";
import {
  CSV_CONTENT_DISPOSITION,
  formatAccessRequestsCsv,
  getFilteredAccessRequests,
  normalizeRequestFilters,
} from "../request-query";

function getDatabase() {
  const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not configured.");
  }

  return neon(databaseUrl);
}

export async function GET(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.redirect(new URL("/admin/requests", request.url), 303);
  }

  const url = new URL(request.url);
  const filters = normalizeRequestFilters({
    q: url.searchParams.get("q"),
    status: url.searchParams.get("status"),
  });
  const rows = await getFilteredAccessRequests(getDatabase(), filters, 1000);
  const csv = formatAccessRequestsCsv(rows);

  return new NextResponse(csv, {
    headers: {
      "Cache-Control": "no-store",
      "Content-Disposition": CSV_CONTENT_DISPOSITION,
      "Content-Type": "text/csv; charset=utf-8",
    },
  });
}
