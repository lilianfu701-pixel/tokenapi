import { addProviderKey, clearCredentialBlock, saveProvider, toggleProvider, updateProviderKey } from "@/lib/admin/actions";
import { listProviders, type Row } from "@/lib/admin/data";
import { Flash, PageHead, Pill, type SearchParams, when } from "../../_components/ui";

const VENDORS = ["alibaba", "deepseek", "google", "moonshot", "openai", "anthropic", "other"];
const PRESETS = [
  ["qwen", "https://dashscope.aliyuncs.com/compatible-mode/v1"],
  ["deepseek", "https://api.deepseek.com/v1"],
  ["gemini", "https://generativelanguage.googleapis.com/v1beta/openai"],
  ["moonshot", "https://api.moonshot.cn/v1"],
  ["openai", "https://api.openai.com/v1"],
  ["anthropic", "https://api.anthropic.com/v1  (adapter: anthropic)"],
];

function ProviderForm({ p }: { p?: Row }) {
  const v = (k: string) => (p?.[k] != null ? String(p[k]) : "");
  return (
    <form action={saveProvider} className="adm-form">
      <label>Id<input name="id" required defaultValue={v("id")} readOnly={Boolean(p)} placeholder="qwen" /></label>
      <label>Name <small>(shown in identity line)</small><input name="name" required defaultValue={v("name")} placeholder="Alibaba" /></label>
      <label>Vendor (model maker)
        <select name="vendor" defaultValue={v("vendor") || "other"}>{VENDORS.map((x) => <option key={x}>{x}</option>)}</select>
      </label>
      <label>Adapter (wire protocol)
        <select name="adapter" defaultValue={v("adapter") || "openai"}>
          <option value="openai">openai — OpenAI-compatible</option>
          <option value="anthropic">anthropic — Messages API</option>
        </select>
      </label>
      <label className="is-wide">API base<input name="api_base" required defaultValue={v("api_base")} placeholder="https://…/v1" /></label>
      <label>First-token timeout (ms)<input name="timeout_ms" type="number" min="1000" max="300000" defaultValue={v("timeout_ms") || "60000"} /></label>
      <label className="is-wide">Extra headers (JSON)<input name="extra_headers" defaultValue={p ? JSON.stringify(p.extra_headers ?? {}) : ""} placeholder='{"X-Foo":"bar"}' /></label>
      <label className="adm-check"><input type="checkbox" name="enabled" defaultChecked={p ? Boolean(p.enabled) : true} /> Enabled</label>
      <button className="adm-btn">{p ? "Save" : "Add provider"}</button>
    </form>
  );
}

export default async function ProvidersPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const { providers, keys, health } = await listProviders();
  return (
    <>
      <PageHead title="Providers" sub="Upstream API endpoints. Keys are encrypted at rest (AES-256-GCM) and never shown again." />
      <Flash params={params} />
      {providers.map((p) => {
        const pk = keys.filter((k) => k.provider_id === p.id);
        const blocks = health.filter((h) => h.provider_id === p.id);
        return (
          <section key={String(p.id)} className="adm-card">
            <div className="adm-cardhead">
              <div>
                <h2>{String(p.name)} <code>{String(p.id)}</code></h2>
                <p className="adm-muted">{String(p.vendor)} · adapter <code>{String(p.adapter)}</code> · {String(p.api_base)} · {String(p.model_count)} models</p>
              </div>
              <div className="adm-actions">
                <Pill on={p.enabled} />
                <form action={toggleProvider}><input type="hidden" name="id" value={String(p.id)} /><button className="adm-btn is-ghost">{p.enabled ? "Disable" : "Enable"}</button></form>
              </div>
            </div>
            {blocks.map((b) => (
              <div key={String(b.key_ref)} className="adm-flash is-error adm-inline">
                <span>
                  Credential <code>{String(b.key_ref)}</code> blocked until {when(b.blocked_until)} after HTTP {String(b.status_code)} — requests skip it and go to fallback.
                  <br /><small>{String(b.reason ?? "")}</small>
                </span>
                <form action={clearCredentialBlock}>
                  <input type="hidden" name="provider_id" value={String(p.id)} /><input type="hidden" name="key_ref" value={String(b.key_ref)} />
                  <button className="adm-btn is-ghost is-small">Unblock now</button>
                </form>
              </div>
            ))}
            <details><summary>Edit</summary><ProviderForm p={p} /></details>
            <h3>API keys</h3>
            {pk.length ? (
              <table className="adm-table">
                <tbody>
                  {pk.map((k) => (
                    <tr key={String(k.id)}>
                      <td>{String(k.label)}</td><td><code>{String(k.key_hint)}</code></td>
                      <td>{k.is_default ? <span className="adm-pill is-on">default</span> : null}</td>
                      <td><Pill on={k.enabled} /></td><td>{when(k.created_at)}</td>
                      <td className="adm-actions">
                        {(["toggle", "default", "delete"] as const).map((op) => (
                          <form key={op} action={updateProviderKey}>
                            <input type="hidden" name="id" value={String(k.id)} /><input type="hidden" name="op" value={op} />
                            <button className="adm-btn is-ghost is-small">{op === "toggle" ? (k.enabled ? "disable" : "enable") : op === "default" ? "make default" : "delete"}</button>
                          </form>
                        ))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : <p className="adm-muted">No key yet (falls back to env PROVIDER_KEY_{String(p.id).toUpperCase()} if set).</p>}
            <form action={addProviderKey} className="adm-inline">
              <input type="hidden" name="provider_id" value={String(p.id)} />
              <input name="label" placeholder="label" className="is-narrow" />
              <input name="key" type="password" placeholder="sk-…" required autoComplete="off" />
              <label className="adm-check"><input type="checkbox" name="is_default" defaultChecked={!pk.length} /> default</label>
              <button className="adm-btn is-small">Add key</button>
            </form>
          </section>
        );
      })}
      <section className="adm-card">
        <h2>Add provider</h2>
        <p className="adm-muted">Common OpenAI-compatible bases: {PRESETS.map(([id, url]) => <span key={id} className="adm-preset"><b>{id}</b> {url}</span>)}</p>
        <ProviderForm />
      </section>
    </>
  );
}
