import type { NeonQueryFunction } from "@neondatabase/serverless";
import { REVIEW_STATUSES, type ReviewStatus, validateReviewStatus } from "./request-review.ts";

export const MAX_QUERY_LENGTH = 120;
export const CSV_CONTENT_DISPOSITION = 'attachment; filename="tokenapi-access-requests.csv"';

type NeonSql = NeonQueryFunction<false, false>;

export type AccessRequestRow = {
  id: string;
  name: string;
  email: string;
  company: string | null;
  use_case: string;
  review_status: ReviewStatus;
  admin_notes: string;
  reviewed_at: Date | string | null;
  submitted_at: Date | string;
};

export type RequestFilters = {
  q: string;
  status: ReviewStatus | null;
};

type FilterInput = {
  q?: string | string[] | null;
  status?: string | string[] | null;
};

function firstValue(value: string | string[] | null | undefined) {
  if (Array.isArray(value)) {
    return value[0] || "";
  }

  return value || "";
}

export function normalizeRequestFilters(input: FilterInput): RequestFilters {
  const q = firstValue(input.q).trim().slice(0, MAX_QUERY_LENGTH);
  const status = validateReviewStatus(firstValue(input.status));

  return {
    q,
    status,
  };
}

export function buildFilterQueryString(filters: RequestFilters) {
  const params = new URLSearchParams();

  if (filters.q) {
    params.set("q", filters.q);
  }

  if (filters.status) {
    params.set("status", filters.status);
  }

  return params.toString();
}

export async function getFilteredAccessRequests(
  sql: NeonSql,
  filters: RequestFilters,
  limit = 100,
) {
  const searchPattern = `%${filters.q}%`;

  if (filters.q && filters.status) {
    return (await sql`
      SELECT id, name, email, company, use_case, review_status, admin_notes, reviewed_at, submitted_at
      FROM access_requests
      WHERE review_status = ${filters.status}
        AND (
          name ILIKE ${searchPattern}
          OR email ILIKE ${searchPattern}
          OR COALESCE(company, '') ILIKE ${searchPattern}
          OR use_case ILIKE ${searchPattern}
        )
      ORDER BY submitted_at DESC
      LIMIT ${limit}
    `) as AccessRequestRow[];
  }

  if (filters.status) {
    return (await sql`
      SELECT id, name, email, company, use_case, review_status, admin_notes, reviewed_at, submitted_at
      FROM access_requests
      WHERE review_status = ${filters.status}
      ORDER BY submitted_at DESC
      LIMIT ${limit}
    `) as AccessRequestRow[];
  }

  if (filters.q) {
    return (await sql`
      SELECT id, name, email, company, use_case, review_status, admin_notes, reviewed_at, submitted_at
      FROM access_requests
      WHERE name ILIKE ${searchPattern}
        OR email ILIKE ${searchPattern}
        OR COALESCE(company, '') ILIKE ${searchPattern}
        OR use_case ILIKE ${searchPattern}
      ORDER BY submitted_at DESC
      LIMIT ${limit}
    `) as AccessRequestRow[];
  }

  return (await sql`
    SELECT id, name, email, company, use_case, review_status, admin_notes, reviewed_at, submitted_at
    FROM access_requests
    ORDER BY submitted_at DESC
    LIMIT ${limit}
  `) as AccessRequestRow[];
}

export function csvEscape(value: Date | string | number | null | undefined) {
  let cell = value === null || value === undefined ? "" : String(value);

  if (/^[=+\-@]/.test(cell)) {
    cell = `'${cell}`;
  }

  const escaped = cell.replaceAll('"', '""');

  if (/[",\r\n]/.test(escaped)) {
    return `"${escaped}"`;
  }

  return escaped;
}

export function formatAccessRequestsCsv(rows: AccessRequestRow[]) {
  const headers = [
    "id",
    "name",
    "email",
    "company",
    "review_status",
    "use_case",
    "admin_notes",
    "reviewed_at",
    "submitted_at",
  ];
  const lines = rows.map((row) =>
    [
      row.id,
      row.name,
      row.email,
      row.company || "",
      row.review_status,
      row.use_case,
      row.admin_notes,
      row.reviewed_at || "",
      row.submitted_at,
    ]
      .map(csvEscape)
      .join(","),
  );

  return [headers.join(","), ...lines].join("\r\n");
}

export { REVIEW_STATUSES };
