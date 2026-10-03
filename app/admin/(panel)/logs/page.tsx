import Link from "next/link";
import { listLogs } from "@/lib/admin/data";
import { PageHead, type SearchParams, Usd, first, when } from "../../_components/ui";

export default async function LogsPage({ searchParams }: { searchParams: SearchParams }) {
  const p = await searchParams;
  const filters = {
    publicModel: first(p.public_model) || undefined,
    provider: first(p.provider) || undefined,
    status: first(p.status) || undefined,
    userEmail: first(p.user) || undefined,
    page: Math.max(1, Number(first(p.page)) || 1),
  };
  const { rows, hasMore } = await listLogs(filters);
  const pageHref = (page: number) => {
    const q = new URLSearchParams();
    if (filters.publicModel) q.set("public_model", filters.publicModel);
    if (filters.provider) q.set("provider", filters.provider);
    if (filters.status) q.set("status", filters.status);
    if (filters.userEmail) q.set("user", filters.userEmail);
    q.set("page", String(page));
    return `/admin/logs?${q}`;
  };

  return (
    <>
      <PageHead title="Request logs" sub="Every request keeps both identities forever: the public model the client called and the real provider/model that served it." />
      <form className="adm-inline adm-card" method="get">
        <input name="public_model" placeholder="public model" defaultValue={filters.publicModel} />
        <input name="provider" placeholder="provider" defaultValue={filters.provider} />
        <select name="status" defaultValue={filters.status ?? ""}>
          <option value="">any status</option><option>success</option><option>error</option><option>client_aborted</option>
        </select>
        <input name="user" placeholder="user email" defaultValue={filters.userEmail} />
        <button className="adm-btn is-small">Filter</button>
      </form>
      <section className="adm-card adm-scroll">
        <table className="adm-table">
          <thead>
            <tr><th>Time</th><th>Request</th><th>User</th><th>API</th><th>Public model</th><th>Real model</th><th>Attempts</th><th>Status</th><th>In / out (cached)</th><th>Cost</th><th>Charge</th><th>TTFT / total</th></tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const attempts = (r.attempts as Array<{ real_model: string; status: number | null; error_type: string | null; error: string | null; skipped?: boolean }>) ?? [];
              return (
                <tr key={String(r.id)}>
                  <td>{when(r.created_at)}</td>
                  <td><code title={String(r.id)}>{String(r.id).slice(-8)}</code></td>
                  <td>{String(r.user_email ?? "—")}</td>
                  <td>{String(r.endpoint)}{r.stream ? " ⇢" : ""}</td>
                  <td><code>{String(r.public_model)}</code></td>
                  <td><code>{String(r.real_model ?? "—")}</code></td>
                  <td title={attempts.map((a) => `${a.real_model} ${a.skipped ? "skipped" : a.status ?? ""} ${a.error_type ?? ""} ${a.error ?? ""}`).join("\n")}>
                    {attempts.length}{r.fallback_used ? " ↻ fallback" : ""}
                  </td>
                  <td className={`adm-status is-${String(r.status)}`} title={r.error ? String(r.error) : undefined}>
                    {String(r.status)}{r.error_type ? <><br /><small>{String(r.error_type)}</small></> : null}
                  </td>
                  <td>{String(r.input_tokens)} / {String(r.output_tokens)} ({String(r.cached_tokens)}){r.usage_estimated ? " ≈" : ""}</td>
                  <td><Usd micros={r.upstream_cost_microusd} /></td>
                  <td><Usd micros={r.customer_charge_microusd} /> <span className="adm-muted">hold <Usd micros={r.hold_microusd} /></span></td>
                  <td>{r.ttft_ms != null ? `${r.ttft_ms}` : "—"} / {String(r.latency_ms ?? "—")} ms</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!rows.length ? <p className="adm-muted">No requests match.</p> : null}
      </section>
      <nav className="adm-pager">
        {filters.page > 1 ? <Link href={pageHref(filters.page - 1)}>← newer</Link> : <span />}
        {hasMore ? <Link href={pageHref(filters.page + 1)}>older →</Link> : null}
      </nav>
    </>
  );
}
