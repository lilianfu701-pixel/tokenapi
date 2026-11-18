import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { DEFAULT_LOCALE, LANG_COOKIE, type Locale, isLocale, localePath, matchAcceptLanguage } from "./lib/i18n/locales";
import { isKnownPath } from "./lib/site-routes";

// Stay on `middleware.ts` (Edge). Next.js 16 `proxy.ts` runs on Node and would bill Fluid
// Active CPU on every request, including static pages.

// Gateway (/v1/*): SDKs send many custom headers (x-stainless-*, anthropic-version, x-api-key...).
// Bearer keys are not cookies, so a wildcard is safe here.
const GATEWAY_CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Expose-Headers": "x-request-id",
  "Access-Control-Max-Age": "86400",
};

const GONE_BODY = JSON.stringify({
  error: {
    message: "This endpoint is disabled.",
    type: "invalid_request_error",
    code: "gone",
    param: null,
  },
});

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

function gone() {
  return new NextResponse(GONE_BODY, {
    status: 410,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "public, max-age=86400",
      ...GATEWAY_CORS_HEADERS,
    },
  });
}

function normalizePath(pathname: string) {
  return pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
}

function hasPrefix(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

/**
 * Site language:
 *  - `?lang=xx` on any page = explicit choice from the language menu: remember it in a
 *    cookie and redirect to the clean URL.
 *  - On "/" only: send the visitor to their language home. Priority: remembered choice,
 *    then the browser's Accept-Language, then English. Other URLs are never redirected,
 *    so shared links and crawlers always get the page they asked for.
 */
function language(request: NextRequest) {
  const url = request.nextUrl;
  const explicit = url.searchParams.get("lang");
  if (explicit !== null) {
    const clean = url.clone();
    clean.searchParams.delete("lang");
    const response = NextResponse.redirect(clean, 307);
    if (isLocale(explicit)) {
      response.cookies.set(LANG_COOKIE, explicit, { path: "/", maxAge: ONE_YEAR_SECONDS, sameSite: "lax" });
    }
    return response;
  }

  if (url.pathname !== "/") return NextResponse.next();

  const remembered = request.cookies.get(LANG_COOKIE)?.value;
  const target: Locale = isLocale(remembered) ? remembered : matchAcceptLanguage(request.headers.get("accept-language")) ?? DEFAULT_LOCALE;

  const response = target === DEFAULT_LOCALE ? NextResponse.next() : NextResponse.redirect(new URL(localePath(target, "/"), url), 307);
  // The answer for "/" depends on these request headers; keep shared caches honest.
  response.headers.set("Vary", "Accept-Language, Cookie");
  return response;
}

/**
 * Any URL outside the site's page set (old indexed pages, typos) gets a permanent redirect
 * to the home page, which then forwards the visitor to their language. Query strings are dropped.
 */
function toHome(request: NextRequest) {
  return NextResponse.redirect(new URL("/", request.nextUrl), 301);
}

/**
 * Admin no longer reads the session or the database. GET/HEAD render the static login page.
 * Anything else (server actions, form posts) is rejected here so no Node function starts.
 */
function admin(request: NextRequest) {
  if (request.method !== "GET" && request.method !== "HEAD") return gone();
  const pathname = normalizePath(request.nextUrl.pathname);
  if (pathname === "/admin/login") return NextResponse.next();
  const url = request.nextUrl.clone();
  url.pathname = "/admin/login";
  return NextResponse.rewrite(url);
}

export function middleware(request: NextRequest) {
  // Server actions are POSTs that would boot a Node function on whatever URL they hit.
  if (request.headers.has("next-action")) return gone();

  const pathname = normalizePath(request.nextUrl.pathname);
  // Retired gateway and data APIs: answer on the edge. No route handler is deployed.
  if (hasPrefix(pathname, "/v1") || hasPrefix(pathname, "/api")) return gone();
  if (hasPrefix(pathname, "/admin")) return admin(request);

  if (!isKnownPath(request.nextUrl.pathname)) return toHome(request);
  // Root files (sitemap, robots, favicon) skip language handling.
  if (pathname.includes(".")) return NextResponse.next();
  return language(request);
}

export const config = {
  // Everything except Next's own build output and Vercel's internal endpoints.
  matcher: ["/((?!_next/|_vercel/).*)"],
};
