import catalog from "./model-catalog.json";
import { type Locale, rich } from "./i18n";
import { fmt, getMessages } from "./locales";
import { price } from "./model-table";

// Reference catalog of first-party models with official list prices (snapshot of models.dev,
// regenerate with `node scripts/build-model-catalog.mjs`). Display only: not gateway routes.

interface CatalogModel {
  id: string;
  name: string;
  released: string | null;
  context: number | null;
  input: number;
  output: number;
  reasoning: boolean;
  tools: boolean;
  vision: boolean;
  openWeights: boolean;
}

interface CatalogVendor {
  id: string;
  en: string;
  zh: string;
  models: CatalogModel[];
}

const VENDORS = catalog.vendors as CatalogVendor[];
export const CATALOG_MODEL_COUNT = VENDORS.reduce((n, v) => n + v.models.length, 0);
export const CATALOG_VENDOR_COUNT = VENDORS.length;

// Traditional-Chinese vendor names; other non-Chinese locales use the English names.
const ZH_TW_VENDOR: Record<string, string> = {
  alibaba: "阿里 通義千問",
  zhipuai: "智譜 GLM",
  volcengine: "字節跳動 豆包（火山引擎）",
  stepfun: "階躍星辰",
};

function vendorName(v: CatalogVendor, locale: Locale) {
  if (locale === "zh") return v.zh;
  if (locale === "zh-tw") return ZH_TW_VENDOR[v.id] ?? v.zh;
  return v.en;
}

function context(n: number | null) {
  if (!n) return "—";
  return n >= 1_000_000 ? `${(n / 1_000_000).toFixed(n % 1_000_000 ? 1 : 0)}M` : `${Math.round(n / 1000)}K`;
}

export function ModelCatalog({ locale }: { locale: Locale }) {
  const t = getMessages(locale).catalog;
  const capKeys = ["reasoning", "tools", "vision", "openWeights"] as const;
  return (
    <section className="catalog" id="catalog" aria-labelledby="catalog-title">
      <div className="catalog-intro">
        <h2 id="catalog-title">{t.title}</h2>
      </div>

      <nav className="catalog-nav" aria-label={t.nav}>
        {VENDORS.map((v) => (
          <a key={v.id} href={`#vendor-${v.id}`}>
            {vendorName(v, locale)} <span>{v.models.length}</span>
          </a>
        ))}
      </nav>

      {VENDORS.map((v) => (
        <section key={v.id} id={`vendor-${v.id}`} className="catalog-vendor" aria-label={vendorName(v, locale)}>
          <header>
            <h3>{vendorName(v, locale)}</h3>
            <span>{fmt(t.models, { n: v.models.length })}</span>
          </header>
          <div className="catalog-row catalog-row-head" aria-hidden="true">
            {t.head.map((h) => <span key={h}>{h}</span>)}
          </div>
          {v.models.map((m) => (
            <article key={m.id} className="catalog-row">
              <div className="model-name">
                <h4>{m.name}</h4>
                <code>{m.id}</code>
              </div>
              <ul className="cap-list" aria-label={t.head[1]}>
                {capKeys.filter((k) => m[k]).map((k) => <li key={k}>{t.caps[k]}</li>)}
              </ul>
              <span className="model-cell" data-label={t.head[2]}>{context(m.context)}</span>
              <span className="model-cell model-price" data-label={t.head[3]}>{price(m.input)}</span>
              <span className="model-cell model-price" data-label={t.head[4]}>{price(m.output)}</span>
              <span className="model-cell catalog-date" data-label={t.head[5]}>{m.released ?? "—"}</span>
            </article>
          ))}
        </section>
      ))}

      <p className="catalog-source">{rich(fmt(t.source, { date: catalog.generated }), locale)}</p>
    </section>
  );
}
