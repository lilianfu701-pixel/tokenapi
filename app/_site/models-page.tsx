import { toPublicModel } from "@/lib/gateway/models";
import { createNeonRepo } from "@/lib/gateway/repo";
import { API_BASE, type Locale, htmlLang, rich } from "./i18n";
import { CATALOG_MODEL_COUNT, CATALOG_VENDOR_COUNT, ModelCatalog } from "./model-catalog";
import { ModelTable, type PublicModel } from "./model-table";
import { SiteFooter, SiteHeader } from "./site-chrome";

export const MODELS_TEXT = {
  en: {
    meta: {
      title: "AI models & pricing | TokenAPI",
      description:
        "Mainstream AI models from OpenAI, Anthropic, Google, DeepSeek, Qwen, Kimi, GLM, Doubao and more, with context length and official per-token prices, plus TokenAPI's callable models.",
    },
    subtitle: "Models & pricing",
    eyebrow: "Models",
    title: "AI models and pricing",
    lead: `${CATALOG_MODEL_COUNT} current models from ${CATALOG_VENDOR_COUNT} model makers, with context length, capabilities and official prices. TokenAPI models are called with one API key at \`${API_BASE}\`.`,
    ownTitle: "TokenAPI models",
    ownBody: "Callable now with your TokenAPI key. Prices are USD per million tokens, charged on actual usage.",
    unavailable: "TokenAPI's own model list is temporarily unavailable. Please try again shortly.",
    jsonKicker: "Programmatic access",
    jsonTitle: "TokenAPI models are also available as JSON.",
    jsonBody: "Use the `id` as the `model` parameter. See the [docs](/docs) for request examples.",
  },
  zh: {
    meta: {
      title: "主流大模型与价格 | TokenAPI",
      description:
        "汇总 OpenAI、Anthropic、Google、DeepSeek、通义千问、Kimi、智谱 GLM、豆包等主流大模型的上下文长度与官方价格，以及 TokenAPI 可直接调用的模型。",
    },
    subtitle: "模型与价格",
    eyebrow: "模型",
    title: "主流大模型与价格",
    lead: `收录 ${CATALOG_VENDOR_COUNT} 家厂商的 ${CATALOG_MODEL_COUNT} 个最新模型，列出上下文长度、能力和官方价格。TokenAPI 模型使用同一个 API Key 通过 \`${API_BASE}\` 调用。`,
    ownTitle: "TokenAPI 可调用模型",
    ownBody: "使用 TokenAPI 的 Key 即可直接调用。价格单位为美元 / 百万 token，按实际用量计费。",
    unavailable: "TokenAPI 模型列表暂时无法加载，请稍后再试。",
    jsonKicker: "接口获取",
    jsonTitle: "TokenAPI 模型也可通过 JSON 接口获取。",
    jsonBody: "把 `id` 作为 `model` 参数传入即可。请求示例见[文档](/docs)。",
  },
} as const;

async function loadModels(): Promise<{ models: PublicModel[]; failed: boolean }> {
  try {
    const aliases = await createNeonRepo().listPublicAliases();
    return { models: aliases.map((a) => toPublicModel(a)), failed: false };
  } catch (e) {
    console.error("[models page] failed to load models", e);
    return { models: [], failed: true };
  }
}

export async function ModelsPage({ locale }: { locale: Locale }) {
  const t = MODELS_TEXT[locale];
  const { models, failed } = await loadModels();
  return (
    <main className="site-shell" lang={htmlLang[locale]}>
      <SiteHeader locale={locale} subtitle={t.subtitle} path="/models" />

      <section className="page-hero">
        <span className="eyebrow">{t.eyebrow}</span>
        <h1>{t.title}</h1>
        <p>{rich(t.lead, locale)}</p>
      </section>

      {failed ? (
        <p className="notice notice-error" role="alert">{t.unavailable}</p>
      ) : models.length > 0 ? (
        <section className="own-models" aria-labelledby="own-title">
          <div className="catalog-intro">
            <h2 id="own-title">{t.ownTitle}</h2>
            <p>{t.ownBody}</p>
          </div>
          <ModelTable models={models} locale={locale} />
        </section>
      ) : null}

      <ModelCatalog locale={locale} />

      <section className="docs-card models-api-note">
        <span className="docs-kicker">{t.jsonKicker}</span>
        <h2>{t.jsonTitle}</h2>
        <pre>{`curl ${API_BASE}/models`}</pre>
        <p>{rich(t.jsonBody, locale)}</p>
      </section>

      <SiteFooter locale={locale} />
    </main>
  );
}
