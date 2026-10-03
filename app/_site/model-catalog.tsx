import catalog from "./model-catalog.json";
import { type Locale, rich } from "./i18n";
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

const T = {
  en: {
    title: "Mainstream model catalog",
    note: `Official model names and official list prices from ${CATALOG_VENDOR_COUNT} model makers, for comparison and planning. Listing here does not mean a model is callable through TokenAPI; call the \`tokenapi-*\` models above, or [contact us](mailto:hello@tokenapi.biz) to request a specific model.`,
    source: `Source: [models.dev](https://models.dev) (MIT), snapshot ${catalog.generated}. Prices are USD per million tokens; the vendor's own pricing page is authoritative.`,
    nav: "Jump to vendor",
    models: (n: number) => `${n} models`,
    head: ["Model", "Capabilities", "Context", "Input / 1M", "Output / 1M", "Released"],
    caps: { reasoning: "Reasoning", tools: "Tool calling", vision: "Vision", openWeights: "Open weights" },
  },
  zh: {
    title: "主流大模型目录",
    note: `汇总 ${CATALOG_VENDOR_COUNT} 家模型厂商的官方型号与官方定价，供选型和比价参考。列在这里不代表可以通过 TokenAPI 直接调用；请调用上方的 \`tokenapi-*\` 模型，或[联系我们](mailto:hello@tokenapi.biz)申请接入指定模型。`,
    source: `数据来源：[models.dev](https://models.dev)（MIT 协议），快照日期 ${catalog.generated}。价格单位为美元 / 百万 token，以各厂商官网为准。`,
    nav: "按厂商跳转",
    models: (n: number) => `${n} 个模型`,
    head: ["模型", "能力", "上下文", "输入 / 百万", "输出 / 百万", "发布"],
    caps: { reasoning: "深度推理", tools: "工具调用", vision: "图像理解", openWeights: "开源权重" },
  },
} as const;

function context(n: number | null) {
  if (!n) return "—";
  return n >= 1_000_000 ? `${(n / 1_000_000).toFixed(n % 1_000_000 ? 1 : 0)}M` : `${Math.round(n / 1000)}K`;
}

export function ModelCatalog({ locale }: { locale: Locale }) {
  const t = T[locale];
  const capKeys = ["reasoning", "tools", "vision", "openWeights"] as const;
  return (
    <section className="catalog" id="catalog" aria-labelledby="catalog-title">
      <div className="catalog-intro">
        <h2 id="catalog-title">{t.title}</h2>
        <p>{rich(t.note, locale)}</p>
      </div>

      <nav className="catalog-nav" aria-label={t.nav}>
        {VENDORS.map((v) => (
          <a key={v.id} href={`#vendor-${v.id}`}>
            {v[locale]} <span>{v.models.length}</span>
          </a>
        ))}
      </nav>

      {VENDORS.map((v) => (
        <section key={v.id} id={`vendor-${v.id}`} className="catalog-vendor" aria-label={v[locale]}>
          <header>
            <h3>{v[locale]}</h3>
            <span>{t.models(v.models.length)}</span>
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

      <p className="catalog-source">{rich(t.source, locale)}</p>
    </section>
  );
}
