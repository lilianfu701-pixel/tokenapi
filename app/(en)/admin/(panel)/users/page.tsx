import { adjustCredit, createUser, toggleApiKey, updateUser } from "@/lib/admin/actions";
import { listUsers } from "@/lib/admin/data";
import { Flash, PageHead, Pill, type SearchParams, Usd, when } from "../../_components/ui";
import { CreateKeyForm } from "./create-key-form";

export default async function UsersPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const { users, keys } = await listUsers();
  return (
    <>
      <PageHead title="Users & API keys" sub="Prepaid USD balance. Each request first reserves its maximum possible cost (atomically, in the database), then settles to the real cost. Requests that cannot be covered are refused." />
      <Flash params={params} />

      {users.map((u) => {
        const uk = keys.filter((k) => k.user_id === u.id);
        const balance = Number(u.balance_microusd);
        return (
          <section key={String(u.id)} className="adm-card">
            <div className="adm-cardhead">
              <div>
                <h2>{String(u.email)} {u.name ? <span className="adm-muted">{String(u.name)}</span> : null}</h2>
                <p className="adm-muted">
                  balance <b className={balance <= 0 ? "adm-neg" : ""}><Usd micros={balance} /></b> · 30-day spend <Usd micros={u.spend_30d} /> · {String(u.rpm_limit)} rpm · since {when(u.created_at).slice(0, 10)}
                </p>
              </div>
              <div className="adm-actions">
                <Pill on={u.enabled} onLabel="active" offLabel="suspended" />
                <form action={updateUser}><input type="hidden" name="user_id" value={String(u.id)} /><input type="hidden" name="toggle" value="true" /><button className="adm-btn is-ghost">{u.enabled ? "Suspend" : "Reactivate"}</button></form>
              </div>
            </div>

            <div className="adm-row">
              <form action={adjustCredit} className="adm-inline">
                <input type="hidden" name="user_id" value={String(u.id)} />
                <input name="amount_usd" type="number" step="0.01" required placeholder="+/- USD" className="is-narrow" />
                <input name="note" placeholder="note (e.g. invoice #)" />
                <button className="adm-btn is-small">Adjust balance</button>
              </form>
              <form action={updateUser} className="adm-inline">
                <input type="hidden" name="user_id" value={String(u.id)} />
                <input name="rpm_limit" type="number" min="1" defaultValue={String(u.rpm_limit)} className="is-narrow" aria-label="RPM limit" />
                <button className="adm-btn is-ghost is-small">Set rpm</button>
              </form>
            </div>

            <h3>API keys</h3>
            {uk.length ? (
              <table className="adm-table">
                <thead><tr><th>Name</th><th>Prefix</th><th>RPM</th><th>Spent / cap</th><th>Aliases</th><th>Expires</th><th>Last used</th><th /></tr></thead>
                <tbody>
                  {uk.map((k) => (
                    <tr key={String(k.id)}>
                      <td>{String(k.name)}</td>
                      <td><code>{String(k.key_prefix)}…</code></td>
                      <td>{k.rpm_limit ? String(k.rpm_limit) : "inherit"}</td>
                      <td><Usd micros={k.spent_microusd} /> / {k.spend_limit_microusd != null ? <Usd micros={k.spend_limit_microusd} /> : "∞"}</td>
                      <td>{Array.isArray(k.allowed_aliases) ? (k.allowed_aliases as string[]).join(", ") : "all"}</td>
                      <td>{when(k.expires_at).slice(0, 10)}</td>
                      <td>{when(k.last_used_at)}</td>
                      <td className="adm-actions">
                        <Pill on={k.enabled} onLabel="active" offLabel="revoked" />
                        <form action={toggleApiKey}><input type="hidden" name="id" value={String(k.id)} /><button className="adm-btn is-ghost is-small">{k.enabled ? "Revoke" : "Restore"}</button></form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : <p className="adm-muted">No keys.</p>}
            <CreateKeyForm userId={String(u.id)} />
          </section>
        );
      })}

      <section className="adm-card">
        <h2>New user</h2>
        <form action={createUser} className="adm-form">
          <label>Email<input name="email" type="email" required /></label>
          <label>Name<input name="name" /></label>
          <label>RPM limit<input name="rpm_limit" type="number" min="1" defaultValue="60" /></label>
          <label>Initial credit (USD)<input name="initial_credit_usd" type="number" min="0" step="0.01" defaultValue="0" /></label>
          <button className="adm-btn">Create user</button>
        </form>
      </section>
    </>
  );
}
