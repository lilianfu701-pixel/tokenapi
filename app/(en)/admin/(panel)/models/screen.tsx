import { saveModel, toggleModel } from "@/lib/admin/actions";
import { listModels, listProviders, type Row } from "@/lib/admin/data";
import { MODEL_CAPABILITIES } from "@/lib/gateway/types";
import { Flash, PageHead, Pill, type SearchParams } from "../../_components/ui";

function ModelForm({ m, providers }: { m?: Row; providers: Row[] }) {
  const v = (k: string) => (m?.[k] != null ? String(m[k]) : "");
  return (
    <form action={saveModel} className="adm-form">
      <label>Provider
        <select name="provider_id" required defaultValue={v("provider_id")} disabled={Boolean(m)}>
          <option value="">—</option>
          {providers.map((p) => <option key={String(p.id)} value={String(p.id)}>{String(p.id)}</option>)}
        </select>
        {m ? <input type="hidden" name="provider_id" value={v("provider_id")} /> : null}
      </label>
      <label>Provider model id<input name="provider_model" required defaultValue={v("provider_model")} readOnly={Boolean(m)} placeholder="qwen-max" /></label>
      <label>Display name<input name="display_name" required defaultValue={v("display_name")} placeholder="Qwen Max" /></label>
      <label>Context length<input name="context_length" type="number" min="0" defaultValue={v("context_length")} /></label>
      <label>Max output tokens <small>(caps pre-auth; default 8192)</small><input name="max_output_tokens" type="number" min="1" defaultValue={v("max_output_tokens")} /></label>
      <fieldset className="adm-caps">
        <legend>Capabilities (shown publicly)</legend>
        {MODEL_CAPABILITIES.map((c) => (
          <label key={c} className="adm-check">
            <input type="checkbox" name="capabilities" value={c} defaultChecked={Array.isArray(m?.capabilities) && (m.capabilities as string[]).includes(c)} /> {c}
          </label>
        ))}
      </fieldset>
      <label>Input $/1M (our cost)<input name="input_price" type="number" step="0.000001" min="0" defaultValue={v("input_price") || "0"} /></label>
      <label>Output $/1M<input name="output_price" type="number" step="0.000001" min="0" defaultValue={v("output_price") || "0"} /></label>
      <label>Cache-read $/1M<input name="cache_read_price" type="number" step="0.000001" min="0" defaultValue={v("cache_read_price")} /></label>
      <label className="adm-check"><input type="checkbox" name="enabled" defaultChecked={m ? Boolean(m.enabled) : true} /> Enabled</label>
      <button className="adm-btn">{m ? "Save" : "Add model"}</button>
    </form>
  );
}

export default async function ModelsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const [models, { providers }] = await Promise.all([listModels(), listProviders()]);
  return (
    <>
      <PageHead title="Models" sub="Real upstream models and what they cost us. Disabling a model removes it from every alias route instantly (≤10s cache)." />
      <Flash params={params} />
      <section className="adm-card">
        <table className="adm-table">
          <thead><tr><th>Real model</th><th>Name</th><th>Context</th><th>Max out</th><th>Capabilities</th><th>In $/1M</th><th>Out $/1M</th><th>Cache $/1M</th><th>Status</th><th /></tr></thead>
          <tbody>
            {models.map((m) => {
              const key = `${m.provider_id}::${m.provider_model}`;
              return (
                <tr key={key}>
                  <td><code>{String(m.provider_id)}/{String(m.provider_model)}</code></td>
                  <td>{String(m.display_name)}</td>
                  <td>{m.context_length ? Number(m.context_length).toLocaleString() : "—"}</td>
                  <td>{m.max_output_tokens ? Number(m.max_output_tokens).toLocaleString() : "8,192*"}</td>
                  <td>{Array.isArray(m.capabilities) && m.capabilities.length ? (m.capabilities as string[]).join(", ") : "—"}</td>
                  <td className="adm-num">{String(m.input_price)}</td>
                  <td className="adm-num">{String(m.output_price)}</td>
                  <td className="adm-num">{m.cache_read_price != null ? String(m.cache_read_price) : "—"}</td>
                  <td><Pill on={m.enabled} /></td>
                  <td className="adm-actions">
                    <form action={toggleModel}><input type="hidden" name="route" value={key} /><button className="adm-btn is-ghost is-small">{m.enabled ? "Disable" : "Enable"}</button></form>
                    <details className="adm-pop"><summary>Edit</summary><ModelForm m={m} providers={providers} /></details>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
      <section className="adm-card">
        <h2>Add model</h2>
        {providers.length ? <ModelForm providers={providers} /> : <p className="adm-muted">Add a provider first.</p>}
      </section>
    </>
  );
}
