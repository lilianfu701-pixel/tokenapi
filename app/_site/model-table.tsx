import type { toPublicModel } from "@/lib/gateway/models";
import type { Locale } from "./i18n";
import { getMessages } from "./locales";

export type PublicModel = ReturnType<typeof toPublicModel>;



/** Exact price (no rounding): what is shown is what is billed. */
export function price(perMillion: number | undefined) {
  if (perMillion == null) return "—";
  const exact = perMillion.toFixed(6).replace(/0+$/, "").replace(/\.$/, "");
  const [whole, frac = ""] = exact.split(".");
  return `$${whole}.${frac.padEnd(2, "0")}`;
}

function context(n: number | null) {
  if (!n) return "—";
  return n >= 1_000_000 ? `${(n / 1_000_000).toFixed(n % 1_000_000 ? 1 : 0)}M` : `${Math.round(n / 1000)}K`;
}

export function ModelTable({ models, locale = "en" }: { models: PublicModel[]; locale?: Locale }) {
  const t = getMessages(locale).table;
  const capLabel = (c: string) => (t.caps as Record<string, string>)[c] ?? c;
  return (
    <section className="model-list" aria-label={t.list}>
      <div className="model-row model-row-head" aria-hidden="true">
        <span>{t.model}</span>
        <span>{t.capabilities}</span>
        <span>{t.context}</span>
        <span>{t.input}</span>
        <span>{t.output}</span>
      </div>
      {models.map((m) => (
        <article key={m.id} className="model-row">
          <div className="model-name">
            <h2>{m.display_name}</h2>
            <code>{m.id}</code>
            {m.description ? <p>{m.description}</p> : null}
          </div>
          <ul className="cap-list" aria-label={t.capabilities}>
            {m.capabilities.map((c) => <li key={c}>{capLabel(c)}</li>)}
          </ul>
          <span className="model-cell" data-label={t.context}>{context(m.context_length)}</span>
          <span className="model-cell model-price" data-label={t.input}>{price(m.pricing?.input_per_million)}</span>
          <span className="model-cell model-price" data-label={t.output}>{price(m.pricing?.output_per_million)}</span>
        </article>
      ))}
    </section>
  );
}
