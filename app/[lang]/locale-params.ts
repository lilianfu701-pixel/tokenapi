import { notFound } from "next/navigation";
import { type Locale, PREFIXED_LOCALES, isLocale } from "@/lib/i18n/locales";

export type LangParams = { params: Promise<{ lang: string }> };

/** Only non-default locales are served under /[lang]; English lives at the root. */
export function localeStaticParams() {
  return PREFIXED_LOCALES.map((lang) => ({ lang }));
}

export async function resolveLocale(params: LangParams["params"]): Promise<Locale> {
  const { lang } = await params;
  if (!isLocale(lang) || lang === "en") notFound();
  return lang;
}
