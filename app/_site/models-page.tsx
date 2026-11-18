import { API_BASE, type Locale, htmlLang, rich } from "./i18n";
import { fmt, getMessages } from "./locales";
import { CATALOG_MODEL_COUNT, CATALOG_VENDOR_COUNT, ModelCatalog } from "./model-catalog";
import { ModelTable } from "./model-table";
import { PUBLIC_MODELS } from "./public-models";
import { SiteFooter, SiteHeader } from "./site-chrome";

export function ModelsPage({ locale }: { locale: Locale }) {
  const t = getMessages(locale).models;
  const models = PUBLIC_MODELS;
  const lead = fmt(t.lead, { models: CATALOG_MODEL_COUNT, vendors: CATALOG_VENDOR_COUNT, base: API_BASE });
  return (
    <main className="site-shell" lang={htmlLang(locale)}>
      <SiteHeader locale={locale} subtitle={t.subtitle} path="/models" />

      <section className="page-hero">
        <span className="eyebrow">{t.eyebrow}</span>
        <h1>{t.title}</h1>
        <p>{rich(lead, locale)}</p>
      </section>

      {models.length > 0 ? (
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
