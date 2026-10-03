import { LEGAL, legalValues } from "@/lib/legal";
import { SITE_URL, type Locale, alternates, htmlLang, rich } from "../i18n";
import { fmt } from "../locales";
import { SiteFooter, SiteHeader } from "../site-chrome";
import { notFound } from "next/navigation";
import { getLegal, legalPagesPublished, legalPath } from ".";
import type { LegalDocKey } from "./types";

function values(path: string): Record<string, string | number> {
  return { ...legalValues(), enUrl: `${SITE_URL}${path}` };
}

export function legalMetadata(locale: Locale, key: LegalDocKey | "contact") {
  const { texts } = getLegal(locale);
  const doc = texts[key];
  return { title: `${doc.title.replace(/­/g, "")} | TokenAPI`, description: doc.description, alternates: alternates(locale, legalPath(key)) };
}

function Notice({ locale, path }: { locale: Locale; path: string }) {
  const { texts, isTranslation } = getLegal(locale);
  if (!isTranslation) return null;
  return <p className="legal-notice">{rich(fmt(texts.chrome.translationNotice, values(path)), locale)}</p>;
}

export function LegalDocPage({ locale, docKey }: { locale: Locale; docKey: LegalDocKey }) {
  if (!legalPagesPublished()) notFound();
  const { texts } = getLegal(locale);
  const doc = texts[docKey];
  const path = legalPath(docKey);
  const v = values(path);
  const t = (s: string) => rich(fmt(s, v), locale);
  const anchor = (i: number) => `s${i + 1}`;
  return (
    <main className="site-shell" lang={htmlLang(locale)}>
      <SiteHeader locale={locale} subtitle={doc.title} path={path} />
      <article className="legal">
        <header className="legal-head">
          <h1>{doc.title}</h1>
          <p className="legal-effective">{fmt(texts.chrome.effective, v)}</p>
          <Notice locale={locale} path={path} />
          <p className="legal-intro">{t(doc.intro)}</p>
        </header>
        <div className="legal-grid">
          <nav className="legal-toc" aria-label={texts.chrome.contents}>
            <strong>{texts.chrome.contents}</strong>
            <ol>
              {doc.sections.map((s, i) => <li key={s.h}><a href={`#${anchor(i)}`}>{s.h}</a></li>)}
            </ol>
          </nav>
          <div className="legal-body">
            {doc.sections.map((s, i) => (
              <section key={s.h} id={anchor(i)}>
                <h2>{s.h}</h2>
                {s.p?.map((para) => <p key={para}>{t(para)}</p>)}
                {s.list ? <ul>{s.list.map((item) => <li key={item}>{t(item)}</li>)}</ul> : null}
              </section>
            ))}
          </div>
        </div>
      </article>
      <SiteFooter locale={locale} />
    </main>
  );
}

export function ContactPage({ locale }: { locale: Locale }) {
  if (!legalPagesPublished()) notFound();
  const { texts } = getLegal(locale);
  const c = texts.contact;
  const path = legalPath("contact");
  const v = values(path);
  return (
    <main className="site-shell" lang={htmlLang(locale)}>
      <SiteHeader locale={locale} subtitle={c.title} path={path} />
      <article className="legal">
        <header className="legal-head">
          <h1>{c.title}</h1>
          <Notice locale={locale} path={path} />
          <p className="legal-intro">{rich(fmt(c.intro, v), locale)}</p>
        </header>
        <div className="contact-grid">
          <section className="contact-card">
            <h2>{c.channelsHeading}</h2>
            <ul className="contact-channels">
              {c.channels.map((ch) => (
                <li key={ch.label}>
                  <strong>{ch.label}</strong>
                  <span>{ch.detail}</span>
                  <a href={`mailto:${LEGAL.emails[ch.emailKey]}`}>{LEGAL.emails[ch.emailKey]}</a>
                </li>
              ))}
            </ul>
          </section>
          <section className="contact-card">
            <h2>{c.companyHeading}</h2>
            <dl className="contact-company">
              <dt>{c.labels.company}</dt><dd>{v.company}</dd>
              {v.jurisdiction ? <><dt>{c.labels.jurisdiction}</dt><dd>{v.jurisdiction}</dd></> : null}
              {v.address ? <><dt>{c.labels.address}</dt><dd>{v.address}</dd></> : null}
            </dl>
            <p className="legal-small">{c.responseNote}</p>
          </section>
        </div>
      </article>
      <SiteFooter locale={locale} />
    </main>
  );
}
