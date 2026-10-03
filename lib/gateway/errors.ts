// OpenAI-style error envelope so official SDKs surface messages correctly.

export class GatewayError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly type = "invalid_request_error",
  ) {
    super(message);
    this.name = "GatewayError";
  }
}

export function errorBody(err: GatewayError) {
  return { error: { message: err.message, type: err.type, code: err.code, param: null } };
}

export function anthropicErrorBody(err: GatewayError) {
  const typeByStatus: Record<number, string> = {
    400: "invalid_request_error",
    401: "authentication_error",
    402: "billing_error",
    403: "permission_error",
    404: "not_found_error",
    429: "rate_limit_error",
  };
  return {
    type: "error",
    error: { type: typeByStatus[err.status] ?? "api_error", message: err.message },
  };
}

export function toGatewayError(e: unknown): GatewayError {
  if (e instanceof GatewayError) return e;
  return new GatewayError(500, "internal_error", "Internal gateway error.", "api_error");
}

/**
 * Upstream failure. `message` (with provider details) goes to logs only;
 * `clientMessage` is what the API caller sees.
 */
export class UpstreamError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly retryable: boolean,
    public readonly clientMessage = "The upstream model returned an error.",
  ) {
    super(message);
    this.name = "UpstreamError";
  }
}

export async function upstreamErrorFromResponse(providerId: string, res: Response) {
  const text = await res.text().catch(() => "");
  let detail = "";
  try {
    const j = JSON.parse(text);
    detail = j?.error?.message ?? j?.message ?? "";
  } catch {
    detail = "";
  }
  return new UpstreamError(
    res.status,
    `${providerId} returned ${res.status}: ${text.slice(0, 500)}`,
    isRetryableStatus(res.status),
    detail ? `Upstream model error: ${String(detail).slice(0, 300)}` : `Upstream model error (HTTP ${res.status}).`,
  );
}

export function networkError(providerId: string, e: unknown) {
  return new UpstreamError(502, `Network error contacting ${providerId}: ${(e as Error)?.message}`, true, "Upstream model unreachable.");
}

/**
 * Only errors caused by the caller's request itself (malformed, too large, invalid params)
 * stop the fallback chain. 401/403/404 upstream mean OUR config is wrong (bad key,
 * renamed model) and 408/429/5xx are transient, so the next route is tried.
 */
const CALLER_FAULT_STATUSES = new Set([400, 413, 422]);
export function isRetryableStatus(status: number) {
  return !CALLER_FAULT_STATUSES.has(status);
}

export type ErrorType =
  | "provider_config" // 401/403/404 upstream, missing key: our configuration is wrong
  | "rate_limited" // upstream 429
  | "upstream_unavailable" // 5xx / network
  | "timeout" // no first token within provider.timeout_ms
  | "invalid_request" // 400/413/422: the caller's request itself
  | "stream_error"; // failed after streaming started

export function classifyUpstreamStatus(status: number): ErrorType {
  if (status === 401 || status === 403 || status === 404) return "provider_config";
  if (status === 429) return "rate_limited";
  if (status === 504) return "timeout";
  if (!isRetryableStatus(status)) return "invalid_request";
  return "upstream_unavailable";
}

/** 401/403 mean the credential itself is bad: stop using it for a while. */
export function isCredentialFailure(status: number) {
  return status === 401 || status === 403;
}

const KEY_PATTERNS = [
  /sk-ant-[A-Za-z0-9_-]{6,}/g,
  /sk-[A-Za-z0-9_-]{6,}/g,
  /AIza[A-Za-z0-9_-]{10,}/g,
  /Bearer\s+[A-Za-z0-9._-]{8,}/gi,
];

/** Strips the actual upstream secret and common key shapes from any text that leaves this module. */
export function redactSecrets(text: string, secrets: string[] = []) {
  let out = text;
  for (const s of secrets) if (s && s.length >= 4) out = out.split(s).join("[REDACTED]");
  for (const re of KEY_PATTERNS) out = out.replace(re, "[REDACTED]");
  return out;
}
