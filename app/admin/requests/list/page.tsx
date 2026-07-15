import { neon } from "@neondatabase/serverless";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "../admin-auth";

export const dynamic = "force-dynamic";

type AccessRequestRow = {
  id: string;
  name: string;
  email: string;
  company: string | null;
  use_case: string;
  submitted_at: Date | string;
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
    SELECT id, name, email, company, use_case, submitted_at
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
                  <th>Use case</th>
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
                    <td>{request.company || "—"}</td>
                    <td>{request.use_case}</td>
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
