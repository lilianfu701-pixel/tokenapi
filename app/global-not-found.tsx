import type { Metadata } from "next";
import Link from "next/link";
import { SiteDocument } from "./_site/document";
import { SiteFooter, SiteHeader } from "./_site/site-chrome";

// URLs that match no route at all. Needed because the app has two root layouts
// (app/(en) and app/[lang]), so there is no single layout to render a 404 inside.

export const metadata: Metadata = {
  title: "Page not found | TokenAPI",
  robots: { index: false, follow: true },
};

export default function GlobalNotFound() {
  return (
    <SiteDocument lang="en">
      <main className="site-shell">
        <SiteHeader />
        <section className="section not-found">
          <span className="eyebrow">404</span>
          <h1>Page not found</h1>
          <p>
            This page does not exist or has moved. Go to the <Link href="/">home page</Link>, browse the{" "}
            <Link href="/models">models</Link> or read the <Link href="/docs">docs</Link>.
          </p>
        </section>
        <SiteFooter />
      </main>
    </SiteDocument>
  );
}
