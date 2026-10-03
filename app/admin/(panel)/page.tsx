import Link from "next/link";
import { dashboardStats, listLogs } from "@/lib/admin/data";
import { PageHead, Usd, when } from "../_components/ui";

export default async function Overview() {
  const [{ totals, byAlias, byProvider }, recent] = await Promise.all([dashboardStats(), listLogs({ page: 1 })]);
  const requests = Number(totals?.requests ?? 0);
  const successRate = requests ? ((Number(totals.ok) / requests) * 100).toFixed(1) : "—";
  const margin = Number(totals?.charge ?? 0) - Number(totals?.cost ?? 0);

  return (
    <>
      <PageHead title="Overview" sub="Last 24 hours" />
      <section className="adm-stats">
        <div><b>{requests.toLocaleString()}</b><span>requests</span></div>
        <div><b>{successRate}{requests ? "%" : ""}</b><span>success</span></div>
        <div><b>{Number(totals?.tokens ?? 0).toLocaleString()}</b><span>tokens</span></div>
        <div><b><Usd micros={totals?.charge} /></b><span>billed</span></div>
        <div><b><Usd micros={totals?.cost} /></b><span>upstream cost</span></div>
        <div className={margin < 0 ? "is-neg" : ""}><b><Usd micros={margin} /></b><span>margin</span></div>
        <div><b>{Number(totals?.fallbacks ?? 0)}</b><span>used fallback</span></div>
        <div className={Number(totals?.config_errors) ? "is-neg" : ""}><b>{Number(totals?.config_errors ?? 0)}</b><span>provider config errors</span></div>
      </section>

      <div className="adm-grid2">
        <section className="adm-card">
          <h2>By public model</h2>
          <table className="adm-table">
            <thead><tr><th>Alias</th><th>Requests</th><th>Billed</th></tr></thead>
            <tbody>
              {byAlias.map((r) => (
                <tr key={String(r.public_model)}><td><code>{String(r.public_model)}</code></td><td>{String(r.requests)}</td><td><Usd micros={r.charge} /></td></tr>
              ))}
            </tbody>
          </table>
        </section>
        <section className="adm-card">
          <h2>By upstream provider</h2>
          <table className="adm-table">
            <thead><tr><th>Provider</th><th>Requests</th><th>OK</th><th>Avg TTFT</th></tr></thead>
            <tbody>
              {byProvider.map((r) => (
                <tr key={String(r.provider)}><td>{String(r.provider)}</td><td>{String(r.requests)}</td><td>{String(r.ok)}</td><td>{String(r.avg_ttft)} ms</td></tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>

      <section className="adm-card">
        <h2>Recent requests <Link href="/admin/logs" className="adm-more">all logs →</Link></h2>
        <table className="adm-table">
          <thead><tr><th>Time</th><th>Public model</th><th>Real model</th><th>Status</th><th>Tokens</th><th>Charge</th></tr></thead>
          <tbody>
            {recent.rows.slice(0, 15).map((r) => (
              <tr key={String(r.id)}>
                <td>{when(r.created_at)}</td>
                <td><code>{String(r.public_model)}</code></td>
                <td><code>{String(r.real_model ?? "—")}</code></td>
                <td className={`adm-status is-${String(r.status)}`}>{String(r.status)}</td>
                <td>{Number(r.input_tokens) + Number(r.output_tokens)}</td>
                <td><Usd micros={r.customer_charge_microusd} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}
