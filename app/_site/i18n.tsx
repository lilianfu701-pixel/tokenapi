import Link from "next/link";
import type { ReactNode } from "react";
import { type Locale, localePath } from "@/lib/i18n/locales";

export { alternates, htmlLang, isLocale, localePath, LOCALES, PREFIXED_LOCALES } from "@/lib/i18n/locales";
export type { Locale } from "@/lib/i18n/locales";

export const CONTACT_EMAIL = "hello@tokenapi.biz";
export const API_BASE = "https://tokenapi.biz/v1";
export const SITE_URL = "https://tokenapi.biz";

/**
 * Tiny inline markup for dictionary strings:
 *   `code`            -> <code>
 *   [label](/path)    -> locale-aware internal link, or external/mailto link
 */
export function rich(text: string, locale: Locale): ReactNode[] {
  const parts = text.split(/(`[^`]+`|\[[^\]]+\]\((?:\/|#|https?:|mailto:)[^)]*\))/g).filter(Boolean);
  return parts.map((part, i) => {
    if (part.startsWith("`") && part.endsWith("`")) return <code key={i}>{part.slice(1, -1)}</code>;
    const link = /^\[([^\]]+)\]\(((?:\/|#|https?:|mailto:)[^)]*)\)$/.exec(part);
    if (link) {
      const [, label, href] = link;
      return href.startsWith("/")
        ? <Link key={i} href={localePath(locale, href)}>{label}</Link>
        : <a key={i} href={href}>{label}</a>;
    }
    return part;
  });
}
