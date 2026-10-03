import { toPublicModel } from "@/lib/gateway/models";
import { createNeonRepo } from "@/lib/gateway/repo";
import { API_BASE, CONTACT_EMAIL, type Locale, htmlLang, rich } from "./i18n";
import { ModelTable, type PublicModel } from "./model-table";
import { SiteFooter, SiteHeader } from "./site-chrome";

export const MODELS_TEXT = {
  en: {
    meta: {
      title: "Models & pricing | TokenAPI",
      description: "TokenAPI models with capabilities, context length and per-token prices. One API key, OpenAI-compatible.",
    },
    subtitle: "Models & pricing",
    eyebrow: "Models",
    title: "Models and per-token prices",
    lead: `Call any model below with the same API key and base URL \`${API_BASE}\`. Prices are in USD per million tokens and are charged on actual usage.`,
    unavailable: "The model list is temporarily unavailable. Please try again shortly.",
    emptyTitle: "Models are being added.",
    emptyBody: `We are onboarding the first models now. Email [${CONTACT_EMAIL}](mailto:${CONTACT_EMAIL}) for early access.`,
    jsonKicker: "Programmatic access",
    jsonTitle: "The same list is available as JSON.",
    jsonBody: "Use the `id` as the `model` parameter. See the [docs](/docs) for request examples.",
  },
  zh: {
    meta: {
      title: "模型与价格 | TokenAPI",
      description: "TokenAPI 全部模型的能力、上下文长度与按 token 价格。一个 API Key，兼容 OpenAI。",
    },
    subtitle: "模型与价格",
    eyebrow: "模型",
    title: "模型与按 token 价格",
    lead: `下列所有模型都使用同一个 API Key 和 base URL \`${API_BASE}\` 调用。价格单位为美元 / 百万 token，按实际用量计费。`,
    unavailable: "模型列表暂时无法加载，请稍后再试。",
    emptyTitle: "模型正在陆续上线。",
    emptyBody: `首批模型正在接入中。申请抢先体验请发邮件至 [${CONTACT_EMAIL}](mailto:${CONTACT_EMAIL})。`,
    jsonKicker: "接口获取",
    jsonTitle: "同样的列表也可通过 JSON 接口获取。",
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
      ) : models.length === 0 ? (
        <section className="notice">
          <h2>{t.emptyTitle}</h2>
          <p>{rich(t.emptyBody, locale)}</p>
        </section>
      ) : (
        <ModelTable models={models} locale={locale} />
      )}

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
