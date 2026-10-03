import type { Locale } from "@/lib/i18n/locales";
import { LEGAL_READY } from "@/lib/legal";
import { de } from "./de";
import { en } from "./en";
import { es } from "./es";
import { fr } from "./fr";
import { ja } from "./ja";
import { ko } from "./ko";
import { pt } from "./pt";
import { ru } from "./ru";
import type { LegalDocKey, LegalTexts } from "./types";
import { zh } from "./zh";
import { zhTW } from "./zh-tw";

// Translations are registered here; until a locale has its own file it falls back to English.
const LEGAL_TEXTS: Partial<Record<Locale, LegalTexts>> = {
  en,
  zh,
  "zh-tw": zhTW,
  ja,
  ko,
  es,
  fr,
  de,
  pt,
  ru,
};

export function getLegal(locale: Locale): { texts: LegalTexts; isTranslation: boolean } {
  const own = LEGAL_TEXTS[locale];
  return { texts: own ?? en, isTranslation: locale !== "en" && Boolean(own) };
}

export const LEGAL_PAGES: Array<{ key: LegalDocKey | "contact"; path: string }> = [
  { key: "terms", path: "/terms" },
  { key: "privacy", path: "/privacy" },
  { key: "acceptableUse", path: "/acceptable-use" },
  { key: "refund", path: "/refund" },
  { key: "contact", path: "/contact" },
];

/**
 * Legal pages are only published once the company details in lib/legal.ts are filled in.
 * In production they 404 (and footer links are hidden) until then; locally they render
 * with visible placeholders so the text can be reviewed.
 */
export function legalPagesPublished() {
  return LEGAL_READY || process.env.VERCEL_ENV !== "production";
}

export function legalPath(key: LegalDocKey | "contact") {
  return LEGAL_PAGES.find((p) => p.key === key)!.path;
}

export { LEGAL_TEXTS };
export type { LegalDocKey, LegalTexts } from "./types";
