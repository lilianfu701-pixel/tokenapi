import { addFallback, deleteFallback, saveAlias, toggleAlias, updateFallback } from "@/lib/admin/actions";
import { listAliases, listModels, listProviders, type Row } from "@/lib/admin/data";
import { Flash, PageHead, Pill, type SearchParams } from "../../_components/ui";

function RouteSelect({ models, name, value }: { models: Row[]; name: string; value?: string }) {
  return (
    <select name={name} required defaultValue={value}>
      <option value="">— choose provider / model —</option>
      {models.map((m) => {
        const v = `${m.provider_id}::${m.provider_model}`;
        return (
          <option key={v} value={v} disabled={!m.enabled}>
            {String(m.provider_id)} / {String(m.provider_model)} — {String(m.display_name)}{m.enabled ? "" : " (disabled)"}
          </option>
        );
      })}
    </select>
  );
}

function KeySelect({ keys, name, value }: { keys: Row[]; name: string; value?: unknown }) {
  return (
    <select name={name} defaultValue={value ? String(value) : ""}>
      <option value="">provider default key</option>
      {keys.map((k) => (
        <option key={String(k.id)} value={String(k.id)}>{String(k.provider_id)} · {String(k.label)} {String(k.key_hint)}</option>
      ))}
    </select>
  );
}

function AliasForm({ a, models, keys }: { a?: Row; models: Row[]; keys: Row[] }) {
  return (
    <form action={saveAlias} className="adm-form">
      <label>Alias (public model id)<input name="alias" defaultValue={a ? String(a.alias) : ""} readOnly={Boolean(a)} required placeholder="premium-model" /></label>
      <label>Display name<input name="display_name" defaultValue={a ? String(a.display_name) : ""} required placeholder="TokenAPI Pro" /></label>
      <label className="is-wide">Routes to<RouteSelect models={models} name="route" value={a ? `${a.provider}::${a.provider_model}` : undefined} /></label>
      <label className="is-wide">Description<input name="description" defaultValue={a?.description ? String(a.description) : ""} /></label>
      <label>Price multiplier<input name="price_multiplier" type="number" step="0.0001" min="0" defaultValue={a ? String(a.price_multiplier) : "1"} /></label>
      <label>Public input $/1M <small>(optional, fixed)</small><input name="public_input_price" type="number" step="0.000001" min="0" defaultValue={a?.public_input_price != null ? String(a.public_input_price) : ""} /></label>
      <label>Public output $/1M<input name="public_output_price" type="number" step="0.000001" min="0" defaultValue={a?.public_output_price != null ? String(a.public_output_price) : ""} /></label>
      <label>Sort order<input name="sort_order" type="number" defaultValue={a ? String(a.sort_order) : "0"} /></label>
      <label>API base override<input name="api_base" defaultValue={a?.api_base ? String(a.api_base) : ""} placeholder="(provider default)" /></label>
      <label>Pinned upstream key<KeySelect keys={keys} name="api_key_id" value={a?.api_key_id} /></label>
      <label className="adm-check"><input type="checkbox" name="inject_identity" defaultChecked={a ? Boolean(a.inject_identity) : true} /> Inject identity metadata</label>
      <label className="adm-check"><input type="checkbox" name="enabled" defaultChecked={a ? Boolean(a.enabled) : true} /> Enabled</label>
      <button type="submit" className="adm-btn">{a ? "Save / re-route" : "Create alias"}</button>
    </form>
  );
}

export default async function AliasesPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const [{ aliases, fallbacks }, models, { keys }] = await Promise.all([listAliases(), listModels(), listProviders()]);

  return (
    <>
      <PageHead
        title="Model aliases"
        sub="The public model ids clients call. Re-point an alias to any provider/model and clients keep working unchanged. Every change is written to the audit log."
      />
      <Flash params={params} />

      {aliases.map((a) => {
        const fbs = fallbacks.filter((f) => f.alias_id === a.id);
        const healthy = a.model_enabled && a.provider_enabled;
        return (
          <section key={String(a.id)} className="adm-card">
            <div className="adm-cardhead">
              <div>
                <h2><code>{String(a.alias)}</code> <span className="adm-muted">“{String(a.display_name)}”</span></h2>
                <p className="adm-route">
                  → <code>{String(a.provider)}/{String(a.provider_model)}</code> {a.model_display_name ? <span className="adm-muted">({String(a.model_display_name)})</span> : null}
                  {!healthy ? <span className="adm-pill is-off">primary route disabled</span> : null}
                </p>
              </div>
              <div className="adm-actions">
                <Pill on={a.enabled} />
                <form action={toggleAlias}><input type="hidden" name="alias" value={String(a.alias)} /><button className="adm-btn is-ghost">{a.enabled ? "Disable" : "Enable"}</button></form>
              </div>
            </div>

            <details>
              <summary>Edit / re-route</summary>
              <AliasForm a={a} models={models} keys={keys} />
            </details>

            <h3>Fallbacks <span className="adm-muted">tried in order when the primary fails before the first token</span></h3>
            {fbs.length ? (
              <ol className="adm-fallbacks">
                {fbs.map((f) => (
                  <li key={String(f.id)} className={f.enabled ? "" : "is-disabled"}>
                    <form action={updateFallback} className="adm-inline is-tight">
                      <input type="hidden" name="id" value={String(f.id)} /><input type="hidden" name="op" value="priority" />
                      <input name="priority" type="number" min="1" max="100" defaultValue={String(f.priority)} aria-label="Priority" className="is-tiny" />
                      <button className="adm-btn is-ghost is-small">set</button>
                    </form>
                    <code>{String(f.provider)}/{String(f.provider_model)}</code>
                    <Pill on={f.enabled} />
                    <form action={updateFallback}><input type="hidden" name="id" value={String(f.id)} /><input type="hidden" name="op" value="toggle" /><button className="adm-btn is-ghost is-small">{f.enabled ? "disable" : "enable"}</button></form>
                    <form action={deleteFallback}><input type="hidden" name="id" value={String(f.id)} /><button className="adm-btn is-ghost is-small">remove</button></form>
                  </li>
                ))}
              </ol>
            ) : <p className="adm-muted">None.</p>}
            <form action={addFallback} className="adm-inline">
              <input type="hidden" name="alias_id" value={String(a.id)} />
              <RouteSelect models={models} name="route" />
              <input name="priority" type="number" min="1" max="100" defaultValue={fbs.length + 1} aria-label="Priority" className="is-narrow" />
              <KeySelect keys={keys} name="api_key_id" />
              <button className="adm-btn is-small">Add fallback</button>
            </form>
          </section>
        );
      })}

      <section className="adm-card">
        <h2>New alias</h2>
        {models.length ? <AliasForm models={models} keys={keys} /> : <p className="adm-muted">Add a provider and a model first.</p>}
      </section>
    </>
  );
}
