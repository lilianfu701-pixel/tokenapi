// Request lifecycle, identical for every inbound API format:
// auth -> parse -> key/alias checks -> rate limit -> resolve alias
// -> pre-authorize a hold (atomic, DB-side) -> try routes (fallback until first chunk)
// -> stream / collect -> log real_model + settle the hold with the actual charge.

import { hashApiKey, newRequestId } from "./crypto";
import { type ErrorType, GatewayError, UpstreamError, toGatewayError } from "./errors";
import { identitySystemPrompt } from "./identity";
import { customerChargeMicrousd, estimatePromptTokensUpper, estimateTokens, formatUsd, holdMicrousd, upstreamCostMicrousd } from "./pricing";
import type { GatewayRepo, RouteAttempt, UsageRecord } from "./repo";
import { type OpenedRoute, openFirstWorkingRoute } from "./route-runner";
import { ChunkAggregator } from "./sse";
import type { ApiKeyContext, ChatChunk, ChatCompletion, ChatRequest, ResolvedAlias, Usage } from "./types";

type Json = Record<string, unknown>;

export interface StreamEncoder {
  start(): Uint8Array[];
  chunk(chunk: ChatChunk): Uint8Array[];
  end(usage: Usage): Uint8Array[];
  error(message: string): Uint8Array[];
}

export interface InboundFormat {
  endpoint: "chat.completions" | "responses" | "messages";
  /** May be async so formats can load state (e.g. a future previous_response_id store). */
  toChat(body: Json): ChatRequest | Promise<ChatRequest>;
  render(completion: ChatCompletion, body: Json): unknown;
  encoder(requestId: string, publicModel: string, created: number, body: Json): StreamEncoder;
  errorBody(err: GatewayError): unknown;
}

export interface GatewayDeps {
  repo: GatewayRepo;
  fetchImpl?: typeof fetch;
  now?: () => number;
}

const RATE_WINDOW_MS = 60_000;

function apiKeyFromHeaders(headers: Headers) {
  const auth = headers.get("authorization");
  if (auth?.toLowerCase().startsWith("bearer ")) return auth.slice(7).trim();
  return headers.get("x-api-key")?.trim() || null;
}

function clientIp(headers: Headers) {
  return headers.get("x-forwarded-for")?.split(",")[0]?.trim() || headers.get("x-real-ip") || null;
}

interface Admitted {
  ctx: ApiKeyContext;
  body: Json;
  chatReq: ChatRequest;
  resolved: ResolvedAlias;
}

/** Everything before money is touched. Throws GatewayError. */
async function admit(request: Request, format: InboundFormat, deps: GatewayDeps, startedAt: number): Promise<Admitted> {
  const key = apiKeyFromHeaders(request.headers);
  if (!key) throw new GatewayError(401, "missing_api_key", "Missing API key. Use 'Authorization: Bearer <key>'.", "authentication_error");

  let body: Json;
  try {
    body = (await request.json()) as Json;
  } catch {
    throw new GatewayError(400, "invalid_json", "Request body must be valid JSON.");
  }
  if (!body || typeof body !== "object") throw new GatewayError(400, "invalid_json", "Request body must be a JSON object.");
  if (typeof body.model !== "string" || !body.model) throw new GatewayError(400, "missing_model", "model is required.");
  const chatReq = await format.toChat(body);

  const ctx = await deps.repo.authenticate(hashApiKey(key));
  if (!ctx) throw new GatewayError(401, "invalid_api_key", "Invalid or disabled API key.", "authentication_error");
  if (ctx.allowedAliases && !ctx.allowedAliases.includes(chatReq.model)) {
    throw new GatewayError(403, "model_not_allowed", `This API key is not allowed to use model '${chatReq.model}'.`, "permission_error");
  }

  const windowStart = Math.floor(startedAt / RATE_WINDOW_MS) * RATE_WINDOW_MS;
  if ((await deps.repo.hitRateLimit(`key:${ctx.keyId}`, windowStart)) > ctx.rpmLimit) {
    throw new GatewayError(429, "rate_limit_exceeded", `Rate limit of ${ctx.rpmLimit} requests/minute exceeded.`, "rate_limit_error");
  }

  const resolved = await deps.repo.resolveAlias(chatReq.model);
  if (!resolved) throw new GatewayError(404, "model_not_found", `The model '${chatReq.model}' does not exist or is disabled.`);
  if (!resolved.routes.length) throw new GatewayError(503, "model_unavailable", `The model '${chatReq.model}' is temporarily unavailable.`, "api_error");
  return { ctx, body, chatReq, resolved };
}

export async function handleGatewayRequest(request: Request, format: InboundFormat, deps: GatewayDeps): Promise<Response> {
  const now = deps.now ?? Date.now;
  const requestId = newRequestId();
  const startedAt = now();
  const baseHeaders = { "x-request-id": requestId };
  const fail = (err: GatewayError) =>
    Response.json(format.errorBody(err), { status: err.status, headers: { ...baseHeaders, ...(err.status === 429 ? { "retry-after": "60" } : {}) } });

  let admitted: Admitted;
  let hold: number;
  try {
    admitted = await admit(request, format, deps, startedAt);
    const { ctx, chatReq, resolved } = admitted;
    const identityText = resolved.alias.inject_identity ? identitySystemPrompt(resolved.alias, resolved.routes[0]) : "";
    hold = holdMicrousd(resolved.alias, resolved.routes, chatReq, estimatePromptTokensUpper(chatReq, identityText));
    const reserved = await deps.repo.reserveCredit(requestId, ctx.userId, ctx.keyId, hold);
    if (reserved === "key_spend_limit") throw new GatewayError(402, "key_spend_limit", "This API key reached its spend limit.", "insufficient_quota");
    if (reserved !== "ok") {
      throw new GatewayError(402, "insufficient_quota",
        `Insufficient balance: this request needs up to ${formatUsd(hold)} reserved. Top up, or lower max_tokens.`, "insufficient_quota");
    }
  } catch (e) {
    if (!(e instanceof GatewayError)) console.error(`[gateway ${requestId}] pre-flight error`, e);
    return fail(toGatewayError(e));
  }

  // From here on a hold exists: EVERY path must end in recordUsage (which settles it).
  const { ctx, body, chatReq, resolved } = admitted;
  const { alias } = resolved;
  const attempts: RouteAttempt[] = [];
  const record = (rec: Partial<UsageRecord> & Pick<UsageRecord, "status" | "httpStatus">) =>
    safeRecord(deps.repo, {
      requestId, userId: ctx.userId, apiKeyId: ctx.keyId, endpoint: format.endpoint, publicModel: alias.alias,
      realModel: null, provider: null, providerModel: null, attempts,
      fallbackUsed: attempts.length > 1, stream: Boolean(chatReq.stream), errorType: null, error: null,
      inputTokens: 0, outputTokens: 0, cachedTokens: 0, usageEstimated: false,
      upstreamCostMicrousd: 0, customerChargeMicrousd: 0, holdMicrousd: hold, priceMultiplier: alias.price_multiplier,
      latencyMs: now() - startedAt, ttftMs: null,
      clientIp: clientIp(request.headers), userAgent: request.headers.get("user-agent"),
      ...rec,
    });

  let opened: Awaited<ReturnType<typeof openFirstWorkingRoute>>;
  try {
    opened = await openFirstWorkingRoute({ resolved, chatReq, repo: deps.repo, fetchImpl: deps.fetchImpl ?? fetch, clientSignal: request.signal, attempts, now });
  } catch (e) {
    console.error(`[gateway ${requestId}] routing crashed`, e);
    await record({ status: "error", httpStatus: 500, errorType: "upstream_unavailable", error: "internal routing error" });
    return fail(new GatewayError(500, "internal_error", "Internal gateway error.", "api_error"));
  }

  if (opened.kind === "failed") {
    const err = opened.fatal
      ? new GatewayError(opened.fatal.status >= 500 ? 502 : opened.fatal.status, "upstream_error", opened.fatal.clientMessage, "api_error")
      : new GatewayError(502, "upstream_unavailable", "All upstream routes failed. Please retry.", "api_error");
    const last = attempts.at(-1);
    await record({
      status: request.signal.aborted ? "client_aborted" : "error",
      httpStatus: err.status,
      errorType: last?.error_type ?? "upstream_unavailable",
      error: attempts.map((a) => `${a.real_model}: ${a.error}`).join(" | ").slice(0, 2000) || null,
    });
    return fail(err);
  }

  return serve(opened, { requestId, startedAt, now, format, body, chatReq, resolved, attempts, record, fail, baseHeaders });
}

interface ServeContext {
  requestId: string;
  startedAt: number;
  now: () => number;
  format: InboundFormat;
  body: Json;
  chatReq: ChatRequest;
  resolved: ResolvedAlias;
  attempts: RouteAttempt[];
  record: (rec: Partial<UsageRecord> & Pick<UsageRecord, "status" | "httpStatus">) => Promise<void>;
  fail: (err: GatewayError) => Response;
  baseHeaders: Record<string, string>;
}

async function serve(opened: OpenedRoute, s: ServeContext): Promise<Response> {
  const { route, first, rest, controller, redact } = opened;
  const { alias } = s.resolved;
  const created = Math.floor(s.startedAt / 1000);
  const ttftMs = s.now() - s.startedAt;
  const agg = new ChunkAggregator();
  const promptEstimate = estimateTokens(JSON.stringify(s.chatReq.messages));

  const finalize = async (status: UsageRecord["status"], httpStatus: number, errorType: ErrorType | null, error: string | null) => {
    const estimated = !agg.usage;
    const raw: Usage = agg.usage ?? {
      prompt_tokens: promptEstimate,
      completion_tokens: estimateTokens(agg.content + agg.reasoning + agg.toolCalls.map((t) => t.function.arguments).join("")),
      total_tokens: 0,
      cached_tokens: 0,
    };
    const usage: Usage = { ...raw, total_tokens: raw.prompt_tokens + raw.completion_tokens };
    await s.record({
      realModel: route.realModel, provider: route.provider.id, providerModel: route.model.provider_model,
      fallbackUsed: s.attempts.length > 1,
      status, httpStatus, errorType, error: error ? redact(error).slice(0, 2000) : null,
      inputTokens: usage.prompt_tokens, outputTokens: usage.completion_tokens, cachedTokens: usage.cached_tokens ?? 0,
      usageEstimated: estimated,
      upstreamCostMicrousd: upstreamCostMicrousd(route.model, usage),
      customerChargeMicrousd: customerChargeMicrousd(alias, route.model, usage),
      latencyMs: s.now() - s.startedAt, ttftMs,
    });
    return usage;
  };
  const clientMessageOf = (e: unknown) => redact(e instanceof UpstreamError ? e.clientMessage : "Upstream stream interrupted.");

  if (!s.chatReq.stream) {
    try {
      if (!first.done) agg.push(first.value);
      for await (const c of rest) agg.push(c);
    } catch (e) {
      await finalize("error", 502, "stream_error", String((e as Error)?.message ?? e));
      return s.fail(new GatewayError(502, "upstream_error", clientMessageOf(e), "api_error"));
    }
    const usage = await finalize("success", 200, null, null);
    return Response.json(s.format.render(agg.build(s.requestId, alias.alias, created, usage), s.body), { headers: s.baseHeaders });
  }

  const encoder = s.format.encoder(s.requestId, alias.alias, created, s.body);
  let finished = false;
  const pump = async (c: ReadableStreamDefaultController<Uint8Array>) => {
    const write = (parts: Uint8Array[]) => parts.forEach((p) => c.enqueue(p));
    try {
      write(encoder.start());
      if (!first.done) {
        agg.push(first.value);
        write(encoder.chunk(first.value));
      }
      for await (const chunk of rest) {
        agg.push(chunk);
        write(encoder.chunk(chunk));
      }
      finished = true;
      write(encoder.end(await finalize("success", 200, null, null)));
    } catch (e) {
      if (!finished && !controller.signal.aborted) {
        finished = true;
        await finalize("error", 502, "stream_error", String((e as Error)?.message ?? e));
        try { write(encoder.error(clientMessageOf(e))); } catch { /* client gone */ }
      }
    } finally {
      try { c.close(); } catch { /* already closed */ }
    }
  };

  const stream = new ReadableStream<Uint8Array>({
    start(c) {
      void pump(c);
    },
    async cancel() {
      controller.abort();
      if (!finished) {
        finished = true;
        await finalize("client_aborted", 499, null, "client disconnected");
      }
    },
  });

  return new Response(stream, {
    headers: {
      ...s.baseHeaders,
      "content-type": "text/event-stream; charset=utf-8",
      "cache-control": "no-cache, no-transform",
      connection: "keep-alive",
      "x-accel-buffering": "no",
    },
  });
}

async function safeRecord(repo: GatewayRepo, rec: UsageRecord) {
  try {
    await repo.recordUsage(rec);
  } catch (e) {
    // Never fail the user's request because logging failed, but make it loud.
    // An unsettled hold is returned by gateway_release_expired_holds() after its TTL.
    console.error(`[gateway ${rec.requestId}] failed to record usage`, e, JSON.stringify(rec));
  }
}
