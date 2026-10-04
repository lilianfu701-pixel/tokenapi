import { formatUsd } from "@/lib/gateway/pricing";

export type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export function first(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v;
}

export function Flash({ params }: { params: Record<string, string | string[] | undefined> }) {
  const ok = first(params.ok);
  const error = first(params.error);
  if (!ok && !error) return null;
  return <p className={`adm-flash ${error ? "is-error" : "is-ok"}`} role={error ? "alert" : "status"}>{error ?? ok}</p>;
}

export function PageHead({ title, sub }: { title: string; sub?: string }) {
  return (
    <header className="adm-pagehead">
      <h1>{title}</h1>
      {sub ? <p>{sub}</p> : null}
    </header>
  );
}

export function Usd({ micros }: { micros: unknown }) {
  return <span className="adm-num">{formatUsd(Number(micros ?? 0))}</span>;
}

export function Pill({ on, onLabel = "enabled", offLabel = "disabled" }: { on: unknown; onLabel?: string; offLabel?: string }) {
  return <span className={`adm-pill ${on ? "is-on" : "is-off"}`}>{on ? onLabel : offLabel}</span>;
}

export function when(v: unknown) {
  if (!v) return "—";
  const d = new Date(String(v));
  return d.toISOString().replace("T", " ").slice(0, 19);
}
