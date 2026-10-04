import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";

// Shared <html> shell for the two root layouts: app/(en) (English at the root, plus admin)
// and app/[lang] (prefixed locales). Separate root layouts let each page declare its own
// <html lang>, which a single layout cannot do without making every page dynamic.

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const baseMetadata: Metadata = {
  metadataBase: new URL("https://tokenapi.biz"),
  title: "TokenAPI | One API key for top AI models",
  description:
    "TokenAPI is an OpenAI-compatible AI model gateway: stable model IDs, automatic failover, streaming, and per-token billing. Works with the OpenAI and Anthropic SDKs.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export function SiteDocument({ lang, children }: { lang: string; children: React.ReactNode }) {
  return (
    <html lang={lang}>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
