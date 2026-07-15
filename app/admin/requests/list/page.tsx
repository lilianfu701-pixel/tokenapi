import { neon } from "@neondatabase/serverless";
import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "../admin-auth";
import {
  buildFilterQueryString,
  getFilteredAccessRequests,
  normalizeRequestFilters,
  REVIEW_STATUSES,
  type RequestFilters,
} from "../request-query";
import type { ReviewStatus } from "../request-review";

export const dynamic = "force-dynamic";

type AdminRequestsListPageProps = {
  searchParams?: Promise<{
    q?: string;
    status?: string;
  }>;
};

const REVIEW_STATUS_LABELS: Record<ReviewStatus, string> = {
  new: "New",
  contacted: "Contacted",
  approved: "Approved",
  rejected: "Rejected",
};

function getDatabase() {
  const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not configured.");
  }

  return neon(databaseUrl);
}

async function getAccessRequests(filters: RequestFilters) {
  return getFilteredAccessRequests(getDatabase(), filters, 100);
}

function formatSubmittedAt(value: Date | string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function buildExportHref(filters: RequestFilters) {
  const queryString = buildFilterQueryString(filters);
  return queryString ? `/admin/requests/export?${queryString}` : "/admin/requests/export";
}

export default async function AdminRequestsListPage({ searchParams }: AdminRequestsListPageProps) {
  const isAuthenticated = await isAdminAuthenticated();

  if (!isAuthenticated) {
    redirect("/admin/requests");
  }

  const filters = normalizeRequestFilters((await searchParams) || {});
  const requests = await getAccessRequests(filters);

  return (
    <main className="admin-shell">
      <header className="admin-header">
        <div>
          <div className="admin-kicker">TokenAPI Admin</div>
          <h1>Admin requests</h1>
          <p>Recent API access requests submitted from the public waitlist.</p>
        </div>
        <form action="/admin/requests/logout" method="post">
          <button className="button button-secondary" type="submit">
            Sign out
          </button>
        </form>
      </header>

      <section className="admin-card">
        <form className="admin-filter-form" action="/admin/requests/list" method="get">
          <label>
            Search
            <input
              defaultValue={filters.q}
              name="q"
              placeholder="Name, email, company, or use case"
              type="search"
            />
          </label>
          <label>
            Status
            <select name="status" defaultValue={filters.status || ""}>
              <option value="">All statuses</option>
              {REVIEW_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {REVIEW_STATUS_LABELS[status]}
                </option>
              ))}
            </select>
          </label>
          <button className="button button-primary" type="submit">
            Apply filters
          </button>
          <Link className="button button-secondary" href="/admin/requests/list">
            Clear
          </Link>
          <Link className="button button-secondary" href={buildExportHref(filters)}>
            Export CSV
          </Link>
        </form>

        <div className="admin-table-header">
          <strong>{requests.length} requests</strong>
          <span>Showing latest 100 matching requests</span>
        </div>

        {requests.length ? (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Company</th>
                  <th>Status</th>
                  <th>Use case</th>
                  <th>Admin notes</th>
                  <th>Submitted</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((request) => (
                  <tr key={request.id}>
                    <td>{request.name}</td>
                    <td>
                      <a href={`mailto:${request.email}`}>{request.email}</a>
                    </td>
                    <td>{request.company || "-"}</td>
                    <td>
                      <form
                        className="admin-review-form"
                        action={`/admin/requests/${request.id}`}
                        method="post"
                      >
                        <label>
                          <span>Review status</span>
                          <select name="review_status" defaultValue={request.review_status}>
                            {REVIEW_STATUSES.map((status) => (
                              <option key={status} value={status}>
                                {REVIEW_STATUS_LABELS[status]}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label>
                          <span>Admin notes</span>
                          <textarea
                            name="admin_notes"
                            defaultValue={request.admin_notes}
                            maxLength={2500}
                            placeholder="Private follow-up notes"
                            rows={4}
                          />
                        </label>
                        <button className="button button-secondary" type="submit">
                          Save review
                        </button>
                      </form>
                    </td>
                    <td>{request.use_case}</td>
                    <td>{request.admin_notes || "No notes yet"}</td>
                    <td>{formatSubmittedAt(request.submitted_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="admin-empty">No access requests have been submitted yet.</p>
        )}
      </section>
    </main>
  );
}
