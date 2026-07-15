type AdminLoginPageProps = {
  searchParams?: Promise<{
    error?: string;
  }>;
};

export default async function AdminLoginPage({ searchParams }: AdminLoginPageProps) {
  const params = await searchParams;
  const hasError = params?.error === "invalid";

  return (
    <main className="admin-shell admin-login-shell">
      <section className="admin-card admin-login-card">
        <div className="admin-kicker">TokenAPI Admin</div>
        <h1>Access request console</h1>
        <p>
          Enter the admin password to view recent API access requests submitted
          from tokenapi.biz.
        </p>

        <form className="admin-form" action="/admin/requests/login" method="post">
          <label>
            Admin password
            <input
              autoComplete="current-password"
              name="password"
              placeholder="Enter admin password"
              required
              type="password"
            />
          </label>
          {hasError ? (
            <p className="admin-error">The password was not accepted. Please try again.</p>
          ) : null}
          <button className="button button-primary" type="submit">
            Open requests
          </button>
        </form>
      </section>
    </main>
  );
}
