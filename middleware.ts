import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { DEFAULT_LOCALE, LANG_COOKIE, type Locale, isLocale, localePath, matchAcceptLanguage } from "./lib/i18n/locales";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Sync-Secret",
  "Access-Control-Max-Age": "86400",
};

// Gateway (/v1/*): SDKs send many custom headers (x-stainless-*, anthropic-version, x-api-key...).
// Bearer keys are not cookies, so a wildcard is safe here.
const GATEWAY_CORS_HEADERS = {
  ...CORS_HEADERS,
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Expose-Headers": "x-request-id",
};

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

function cors(request: NextRequest) {
  const headers = request.nextUrl.pathname.startsWith("/v1/") ? GATEWAY_CORS_HEADERS : CORS_HEADERS;
  if (request.method === "OPTIONS") return new NextResponse(null, { status: 204, headers });
  const response = NextResponse.next();
  for (const [key, value] of Object.entries(headers)) response.headers.set(key, value);
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

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname.startsWith("/api/v1/") || pathname.startsWith("/v1/")) return cors(request);
  return language(request);
}

export const config = {
  matcher: [
    "/api/v1/:path*",
    "/v1/:path*",
    // Site pages: everything except Next internals, API/admin routes and static files.
    "/((?!_next/|api/|v1/|admin|favicon|.*\\.[a-zA-Z0-9]+$).*)",
  ],
};
