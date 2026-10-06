import { GatewayError, errorBody } from "@/lib/gateway/errors";

// Unknown gateway paths get a JSON error that SDKs can surface, instead of falling through
// to the site's not-found handling (which redirects browsers to the home page).

function unknownEndpoint(request: Request) {
  const { pathname } = new URL(request.url);
  const err = new GatewayError(404, "unknown_endpoint", `Unknown endpoint: ${request.method} ${pathname}. See https://tokenapi.biz/docs`);
  return Response.json(errorBody(err), { status: err.status });
}

export const GET = unknownEndpoint;
export const POST = unknownEndpoint;
export const PUT = unknownEndpoint;
export const PATCH = unknownEndpoint;
export const DELETE = unknownEndpoint;
