import Link from "next/link";
import { heroCode } from "./home-content";
import { CONTACT_EMAIL, type Locale, htmlLang, localePath, rich } from "./i18n";
import { fmt, getMessages } from "./locales";
import { SiteFooter, SiteHeader, ctaMailto } from "./site-chrome";

export function HomePage({ locale }: { locale: Locale }) {
  const t = getMessages(locale).home;
  return (
    <main className="site-shell" lang={htmlLang(locale)}>
      <SiteHeader locale={locale} path="/" />

      <section className="hero" id="product">
        <div className="hero-copy">
          <span className="eyebrow">{t.eyebrow}</span>
          <h1>{t.title}</h1>
          <p>{t.lead}</p>
          <div className="hero-actions">
            <a className="button button-primary" href={ctaMailto(locale)}>{t.ctaPrimary}</a>
            <Link className="button button-secondary" href={localePath(locale, "/models")}>{t.ctaSecondary}</Link>
          </div>
        </div>
        <aside className="api-console" aria-label="Example request">
          <div className="console-bar">
            <span>quickstart.ts</span>
            <span>OpenAI SDK</span>
          </div>
          <pre>{heroCode}</pre>
        </aside>
      </section>

      <section className="stats-band stats-band-4" aria-label="TokenAPI highlights">
        {t.stats.map((s) => (
          <article key={s.label}>
            <strong>{s.value}</strong>
            <span>{s.label}</span>
          </article>
        ))}
      </section>

      <section className="section split-section" id="how">
        <div className="section-intro">
          <span className="eyebrow">{t.how.eyebrow}</span>
          <h2>{t.how.title}</h2>
          <p>{t.how.body}</p>
        </div>
        <ol className="route-flow" aria-label={t.how.eyebrow}>
          {t.how.steps.map((step, i) => (
            <li key={step.title}>
              <span className="route-step">{i + 1}</span>
              <div>
                <h3>{step.title}</h3>
                <p>{rich(step.body, locale)}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="section" id="features">
        <div className="section-heading">
          <span className="eyebrow">{t.features.eyebrow}</span>
          <h2>{t.features.title}</h2>
        </div>
        <div className="capability-grid feature-grid">
          {t.features.items.map((f) => (
            <article key={f.title} className="content-card">
              <span className="endpoint">{f.kicker}</span>
              <h3>{f.title}</h3>
              <p>{f.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section pricing-section" id="pricing">
        <div className="section-heading">
          <span className="eyebrow">{t.pricing.eyebrow}</span>
          <h2>{t.pricing.title}</h2>
        </div>
        <div className="pricing-grid pricing-grid-2">
          {[t.pricing.payg, t.pricing.custom].map((tier, i) => (
            <article key={tier.name} className="pricing-card">
              <div>
                <span>{tier.tag}</span>
                <h3>{tier.name}</h3>
              </div>
              <strong>{tier.headline}</strong>
              <p>{tier.body}</p>
              <ul>
                {tier.bullets.map((b) => <li key={b}>{b}</li>)}
              </ul>
              {i === 0 ? (
                <Link className="button button-primary" href={localePath(locale, "/models")}>{tier.cta}</Link>
              ) : (
                <a className="button button-secondary" href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(t.pricing.custom.subject)}`}>{tier.cta}</a>
              )}
            </article>
          ))}
        </div>
      </section>

      <section className="section faq-section" id="faq">
        <div className="section-heading">
          <span className="eyebrow">{t.faq.eyebrow}</span>
          <h2>{t.faq.title}</h2>
        </div>
        <div className="faq-list">
          {t.faq.items.map((item) => (
            <article key={item.q} className="faq-item">
              <h3>{item.q}</h3>
              <p>{fmt(item.a, { email: CONTACT_EMAIL })}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="contact-section" id="contact">
        <div className="access-copy">
          <span className="eyebrow">{t.contact.eyebrow}</span>
          <h2>{t.contact.title}</h2>
          <p>{t.contact.body}</p>
        </div>
        <div className="hero-actions">
          <a className="button button-primary" href={ctaMailto(locale)}>{t.contact.primary}</a>
          <Link className="button button-secondary" href={localePath(locale, "/docs")}>{t.contact.secondary}</Link>
        </div>
      </section>

      <SiteFooter locale={locale} />
    </main>
  );
}
