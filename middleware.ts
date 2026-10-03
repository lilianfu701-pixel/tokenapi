import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

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

export function middleware(request: NextRequest) {
  const headers = request.nextUrl.pathname.startsWith("/v1/") ? GATEWAY_CORS_HEADERS : CORS_HEADERS;

  if (request.method === "OPTIONS") {
    return new NextResponse(null, { status: 204, headers });
  }

  const response = NextResponse.next();
  for (const [key, value] of Object.entries(headers)) {
    response.headers.set(key, value);
  }
  return response;
}

export const config = {
  matcher: ["/api/v1/:path*", "/v1/:path*"],
};
