import Link from "next/link";
import type { ReactNode } from "react";

export type Locale = "en" | "zh";

export const CONTACT_EMAIL = "hello@tokenapi.biz";
export const API_BASE = "https://tokenapi.biz/v1";
export const SITE_URL = "https://tokenapi.biz";

/** "/models" -> "/zh/models"; keeps "#hash" anchors. */
export function localePath(locale: Locale, path: string) {
  if (locale === "en") return path;
  if (path === "/") return "/zh";
  if (path.startsWith("/#")) return `/zh${path.slice(1)}`;
  return `/zh${path}`;
}

/** hreflang alternates for a page path (without locale prefix). */
export function alternates(locale: Locale, path: string) {
  return {
    canonical: localePath(locale, path),
    languages: { en: path, "zh-CN": localePath("zh", path), "x-default": path },
  };
}

export const htmlLang: Record<Locale, string> = { en: "en", zh: "zh-CN" };

/**
 * Tiny inline markup for dictionary strings:
 *   `code`            -> <code>
 *   [label](/path)    -> locale-aware internal link, or external/mailto link
 */
export function rich(text: string, locale: Locale): ReactNode[] {
  const parts = text.split(/(`[^`]+`|\[[^\]]+\]\([^)]+\))/g).filter(Boolean);
  return parts.map((part, i) => {
    if (part.startsWith("`") && part.endsWith("`")) return <code key={i}>{part.slice(1, -1)}</code>;
    const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(part);
    if (link) {
      const [, label, href] = link;
      return href.startsWith("/")
        ? <Link key={i} href={localePath(locale, href)}>{label}</Link>
        : <a key={i} href={href}>{label}</a>;
    }
    return part;
  });
}
