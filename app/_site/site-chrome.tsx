import Link from "next/link";

export const CONTACT_EMAIL = "hello@tokenapi.biz";
export const API_BASE = "https://tokenapi.biz/v1";

const NAV = [
  { label: "Models", href: "/models" },
  { label: "Docs", href: "/docs" },
  { label: "Pricing", href: "/#pricing" },
  { label: "FAQ", href: "/#faq" },
] as const;

export function SiteHeader({ subtitle = "Unified AI model API" }: { subtitle?: string }) {
  return (
    <header className="topbar">
      <Link className="brand" href="/" aria-label="TokenAPI home">
        <span className="brand-mark" aria-hidden="true">T</span>
        <span>
          <strong>TokenAPI</strong>
          <small>{subtitle}</small>
        </span>
      </Link>
      <nav className="topnav" aria-label="Primary navigation">
        {NAV.map((item) => (
          <Link key={item.href} href={item.href}>{item.label}</Link>
        ))}
        <a className="topnav-cta" href={`mailto:${CONTACT_EMAIL}?subject=TokenAPI%20API%20key`}>Get an API key</a>
      </nav>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="footer">
      <span>TokenAPI.biz</span>
      <span>
        <Link href="/models">Models</Link> · <Link href="/docs">Docs</Link> · <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
      </span>
      <span>OpenAI-compatible · Anthropic-compatible</span>
    </footer>
  );
}
