// The site's public URL space, used by middleware to send unknown URLs (old indexed pages,
// typos, retired endpoints) to the home page. tests/gateway/site-routes.test.ts fails if a
// page is added under app/ without being listed here.

import { PREFIXED_LOCALES } from "./i18n/locales";

/** Page paths without the locale prefix; each exists in English (root) and every locale. */
export const SITE_PAGES = ["/", "/models", "/docs", "/terms", "/privacy", "/acceptable-use", "/refund", "/contact"] as const;

/** Files served at the root (metadata routes and public/). */
const ROOT_FILES = new Set(["/sitemap.xml", "/robots.txt", "/favicon.svg"]);

/** Whole subtrees owned by their own handlers: admin panel, gateway (JSON 404s), Next/Vercel internals. */
const OWNED_PREFIXES = ["/admin", "/v1", "/_next", "/_vercel"];

const PAGES = new Set<string>(SITE_PAGES);
const LOCALE_PREFIXES = new Set<string>(PREFIXED_LOCALES);

export function isKnownPath(pathname: string): boolean {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  if (ROOT_FILES.has(path)) return true;
  if (OWNED_PREFIXES.some((p) => path === p || path.startsWith(`${p}/`))) return true;
  if (PAGES.has(path)) return true;
  const [, first, ...rest] = path.split("/");
  return LOCALE_PREFIXES.has(first) && PAGES.has(rest.length ? `/${rest.join("/")}` : "/");
}
