import { listAudit } from "@/lib/admin/data";
import { PageHead, when } from "../../_components/ui";

export default async function AuditPage() {
  const rows = await listAudit();
  return (
    <>
      <PageHead title="Audit log" sub="Append-only record of admin changes, including every alias re-route (before → after)." />
      <section className="adm-card adm-scroll">
        <table className="adm-table">
          <thead><tr><th>Time</th><th>Action</th><th>Entity</th><th>Change</th></tr></thead>
          <tbody>
            {rows.map((r) => {
              const before = r.before as Record<string, unknown> | null;
              const after = r.after as Record<string, unknown> | null;
              const route = (x: Record<string, unknown> | null) => (x?.provider ? `${x.provider}/${x.provider_model}` : null);
              return (
                <tr key={String(r.id)}>
                  <td>{when(r.created_at)}</td>
                  <td><b>{String(r.action)}</b></td>
                  <td>{String(r.entity)} <code>{String(r.entity_id ?? "")}</code></td>
                  <td>
                    {r.action === "reroute" ? <code>{route(before)} → {route(after)}</code> : (
                      <details><summary>details</summary><pre className="adm-pre">{JSON.stringify({ before, after }, null, 2)}</pre></details>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </>
  );
}
