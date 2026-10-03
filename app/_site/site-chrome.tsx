import Link from "next/link";
import { CONTACT_EMAIL, LOCALES, type Locale, localePath } from "./i18n";
import { getMessages } from "./locales";

export { API_BASE, CONTACT_EMAIL } from "./i18n";

export function ctaMailto(locale: Locale) {
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(getMessages(locale).chrome.ctaSubject)}`;
}

/**
 * Language menu. Links carry ?lang=xx so the middleware stores the explicit choice in the
 * tokenapi_lang cookie (then strips the param); after that, browser-language detection on
 * "/" no longer overrides the visitor's choice.
 */
function LanguageMenu({ locale, path }: { locale: Locale; path: string }) {
  const t = getMessages(locale).chrome;
  const current = LOCALES.find((l) => l.code === locale)!;
  return (
    <details className="lang-menu">
      <summary aria-label={`${t.langMenu}: ${current.label}`}>
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false">
          <path
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm0 0c2.5 2.4 3.8 5.4 3.8 9s-1.3 6.6-3.8 9m0-18C9.5 5.4 8.2 8.4 8.2 12s1.3 6.6 3.8 9M3.5 9h17M3.5 15h17"
          />
        </svg>
        <span>{current.label}</span>
      </summary>
      <ul role="list">
        {LOCALES.map((l) => (
          <li key={l.code}>
            <a
              href={`${localePath(l.code, path)}?lang=${l.code}`}
              hrefLang={l.html}
              lang={l.html}
              aria-current={l.code === locale ? "true" : undefined}
            >
              {l.label}
            </a>
          </li>
        ))}
      </ul>
    </details>
  );
}

interface HeaderProps {
  locale?: Locale;
  subtitle?: string;
  /** Page path without locale prefix, used by the language menu. */
  path?: string;
}

export function SiteHeader({ locale = "en", subtitle, path = "/" }: HeaderProps) {
  const t = getMessages(locale).chrome;
  const nav = [
    { label: t.nav.models, href: "/models" },
    { label: t.nav.docs, href: "/docs" },
    { label: t.nav.pricing, href: "/#pricing" },
    { label: t.nav.faq, href: "/#faq" },
  ];
  return (
    <header className="topbar">
      <Link className="brand" href={localePath(locale, "/")} aria-label="TokenAPI home">
        <span className="brand-mark" aria-hidden="true">T</span>
        <span>
          <strong>TokenAPI</strong>
          <small>{subtitle ?? t.tagline}</small>
        </span>
      </Link>
      <nav className="topnav" aria-label={t.navAria}>
        {nav.map((item) => (
          <Link key={item.href} href={localePath(locale, item.href)}>{item.label}</Link>
        ))}
        <LanguageMenu locale={locale} path={path} />
        <a className="topnav-cta" href={ctaMailto(locale)}>{t.cta}</a>
      </nav>
    </header>
  );
}

export function SiteFooter({ locale = "en" }: { locale?: Locale }) {
  const t = getMessages(locale).chrome;
  return (
    <footer className="footer">
      <span>TokenAPI.biz</span>
      <span>
        <Link href={localePath(locale, "/models")}>{t.nav.models}</Link> · <Link href={localePath(locale, "/docs")}>{t.nav.docs}</Link> ·{" "}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
      </span>
      <span>{t.footerTag}</span>
    </footer>
  );
}

