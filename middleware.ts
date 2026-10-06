import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { DEFAULT_LOCALE, LANG_COOKIE, type Locale, isLocale, localePath, matchAcceptLanguage } from "./lib/i18n/locales";
import { isKnownPath } from "./lib/site-routes";

// Gateway (/v1/*): SDKs send many custom headers (x-stainless-*, anthropic-version, x-api-key...).
// Bearer keys are not cookies, so a wildcard is safe here.
const GATEWAY_CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Expose-Headers": "x-request-id",
  "Access-Control-Max-Age": "86400",
};

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

function cors(request: NextRequest) {
  if (request.method === "OPTIONS") return new NextResponse(null, { status: 204, headers: GATEWAY_CORS_HEADERS });
  const response = NextResponse.next();
  for (const [key, value] of Object.entries(GATEWAY_CORS_HEADERS)) response.headers.set(key, value);
  return response;
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
 * Any URL outside the site's page set (old indexed pages, typos, retired endpoints such as
 * the former /api/v1 data API) gets a permanent redirect to the home page, which then
 * forwards the visitor to their language. Query strings are dropped.
 */
function toHome(request: NextRequest) {
  return NextResponse.redirect(new URL("/", request.nextUrl), 301);
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === "/v1" || pathname.startsWith("/v1/")) return cors(request);
  if (!isKnownPath(pathname)) return toHome(request);
  // Admin panel and root files (sitemap, robots, favicon) skip language handling.
  if (pathname.startsWith("/admin") || pathname.includes(".")) return NextResponse.next();
  return language(request);
}

export const config = {
  // Everything except Next's own build output and Vercel's internal endpoints.
  matcher: ["/((?!_next/|_vercel/).*)"],
};
