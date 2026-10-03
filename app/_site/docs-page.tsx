import { DOCS, DOC_CODE, type DocSection } from "./docs-content";
import { CONTACT_EMAIL, type Locale, htmlLang, rich } from "./i18n";
import { SiteFooter, SiteHeader } from "./site-chrome";

function Code({ label, children }: { label: string; children: string }) {
  return (
    <figure className="code-block">
      <figcaption>{label}</figcaption>
      <pre>{children}</pre>
    </figure>
  );
}

function Section({ section, locale }: { section: DocSection; locale: Locale }) {
  const t = DOCS[locale];
  return (
    <section className={`docs-card${section.note ? " launch-note" : ""}`} id={section.id}>
      <span className="docs-kicker">{section.kicker}</span>
      <h2>{section.title}</h2>
      {section.blocks.map((b, i) => {
        if ("p" in b) return <p key={i}>{rich(b.p, locale)}</p>;
        if ("pre" in b) return <pre key={i}>{b.pre}</pre>;
        if ("code" in b) return <Code key={i} label={b.label}>{DOC_CODE[b.code]}</Code>;
        if ("list" in b) {
          return (
            <ul key={i} className="docs-list">
              {b.list.map((item) => <li key={item}>{rich(item, locale)}</li>)}
            </ul>
          );
        }
        if ("endpoints" in b) {
          return (
            <div key={i} className="endpoint-table">
              {t.endpoints.map((e) => (
                <article key={e.path} className="endpoint-row">
                  <span>{e.method}</span>
                  <code>{e.path}</code>
                  <div>
                    <h3>{e.title}</h3>
                    <p>{e.description}</p>
                  </div>
                </article>
              ))}
            </div>
          );
        }
        return (
          <div key={i} className="error-grid">
            {t.errors.map((e) => (
              <article key={e.code}>
                <strong>{e.code}</strong>
                <code>{e.name}</code>
                <p>{e.detail}</p>
              </article>
            ))}
          </div>
        );
      })}
      {section.note ? <a className="button button-primary" href={`mailto:${CONTACT_EMAIL}`}>{t.contactCta}</a> : null}
    </section>
  );
}

export function DocsPage({ locale }: { locale: Locale }) {
  const t = DOCS[locale];
  return (
    <main className="site-shell" lang={htmlLang[locale]}>
      <SiteHeader locale={locale} subtitle={t.subtitle} path="/docs" />

      <section className="page-hero" id="overview">
        <span className="eyebrow">{t.eyebrow}</span>
        <h1>{t.title}</h1>
        <p>{rich(t.lead, locale)}</p>
      </section>

      <div className="docs-grid">
        <aside className="docs-sidebar" aria-label={t.sidebarLabel}>
          {t.sections.map((s) => <a key={s.id} href={`#${s.id}`}>{s.nav}</a>)}
        </aside>
        <div className="docs-content">
          {t.sections.map((s) => <Section key={s.id} section={s} locale={locale} />)}
        </div>
      </div>

      <SiteFooter locale={locale} />
    </main>
  );
}
