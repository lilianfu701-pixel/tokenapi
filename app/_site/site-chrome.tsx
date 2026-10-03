import Link from "next/link";
import { CONTACT_EMAIL, type Locale, localePath } from "./i18n";

export { API_BASE, CONTACT_EMAIL } from "./i18n";

const CHROME = {
  en: {
    tagline: "Unified AI model API",
    nav: [
      { label: "Models", href: "/models" },
      { label: "Docs", href: "/docs" },
      { label: "Pricing", href: "/#pricing" },
      { label: "FAQ", href: "/#faq" },
    ],
    cta: "Get an API key",
    ctaSubject: "TokenAPI API key",
    switchLabel: "中文",
    switchAria: "切换到中文",
    footerTag: "OpenAI-compatible · Anthropic-compatible",
    models: "Models",
    docs: "Docs",
  },
  zh: {
    tagline: "统一大模型 API",
    nav: [
      { label: "模型", href: "/models" },
      { label: "文档", href: "/docs" },
      { label: "价格", href: "/#pricing" },
      { label: "常见问题", href: "/#faq" },
    ],
    cta: "申请 API Key",
    ctaSubject: "申请 TokenAPI API Key",
    switchLabel: "EN",
    switchAria: "Switch to English",
    footerTag: "兼容 OpenAI · 兼容 Anthropic",
    models: "模型",
    docs: "文档",
  },
} as const;

export function ctaMailto(locale: Locale) {
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(CHROME[locale].ctaSubject)}`;
}

interface HeaderProps {
  locale?: Locale;
  subtitle?: string;
  /** Page path without locale prefix, used for the language switch. */
  path?: string;
}

export function SiteHeader({ locale = "en", subtitle, path = "/" }: HeaderProps) {
  const t = CHROME[locale];
  const other: Locale = locale === "en" ? "zh" : "en";
  return (
    <header className="topbar">
      <Link className="brand" href={localePath(locale, "/")} aria-label="TokenAPI home">
        <span className="brand-mark" aria-hidden="true">T</span>
        <span>
          <strong>TokenAPI</strong>
          <small>{subtitle ?? t.tagline}</small>
        </span>
      </Link>
      <nav className="topnav" aria-label={locale === "zh" ? "主导航" : "Primary navigation"}>
        {t.nav.map((item) => (
          <Link key={item.href} href={localePath(locale, item.href)}>{item.label}</Link>
        ))}
        <Link className="topnav-lang" href={localePath(other, path)} hrefLang={other === "zh" ? "zh-CN" : "en"} aria-label={t.switchAria}>
          {t.switchLabel}
        </Link>
        <a className="topnav-cta" href={ctaMailto(locale)}>{t.cta}</a>
      </nav>
    </header>
  );
}

export function SiteFooter({ locale = "en" }: { locale?: Locale }) {
  const t = CHROME[locale];
  return (
    <footer className="footer">
      <span>TokenAPI.biz</span>
      <span>
        <Link href={localePath(locale, "/models")}>{t.models}</Link> · <Link href={localePath(locale, "/docs")}>{t.docs}</Link> ·{" "}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
      </span>
      <span>{t.footerTag}</span>
    </footer>
  );
}
