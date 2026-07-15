import { neon } from "@neondatabase/serverless";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "../admin-auth";
import { REVIEW_STATUSES, type ReviewStatus } from "../request-review";

export const dynamic = "force-dynamic";

type AccessRequestRow = {
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

async function getAccessRequests() {
  const sql = getDatabase();
  const rows = await sql`
    SELECT id, name, email, company, use_case, review_status, admin_notes, reviewed_at, submitted_at
    FROM access_requests
    ORDER BY submitted_at DESC
    LIMIT 100
  `;

  return rows as AccessRequestRow[];
}

function formatSubmittedAt(value: Date | string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default async function AdminRequestsListPage() {
  const isAuthenticated = await isAdminAuthenticated();

  if (!isAuthenticated) {
    redirect("/admin/requests");
  }

  const requests = await getAccessRequests();

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
        <div className="admin-table-header">
          <strong>{requests.length} requests</strong>
          <span>Showing latest 100</span>
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
