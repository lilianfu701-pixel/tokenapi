// Tries an alias's routes in priority order until one produces its first chunk.

import { getAdapter } from "./adapters";
import { UpstreamError, classifyUpstreamStatus, isCredentialFailure, redactSecrets } from "./errors";
import { injectIdentity } from "./identity";
import { outputCapForRoute } from "./pricing";
import { credentialRef, type GatewayRepo, type RouteAttempt } from "./repo";
import type { ChatChunk, ChatRequest, ResolvedAlias, Route } from "./types";

/** How long a provider credential is skipped after a 401/403. */
export const CREDENTIAL_COOLDOWN_MS = Number(process.env.GATEWAY_CREDENTIAL_COOLDOWN_MS ?? 10 * 60_000);

export interface OpenedRoute {
  kind: "opened";
  route: Route;
  first: IteratorResult<ChatChunk>;
  rest: AsyncGenerator<ChatChunk>;
  controller: AbortController;
  /** Strips this route's upstream secret from any text before it is logged or returned. */
  redact: (text: string) => string;
}

export interface FailedRoutes {
  kind: "failed";
  /** Set when a caller-fault error (400/413/422) stopped the chain. */
  fatal?: UpstreamError;
}

interface RunOptions {
  resolved: ResolvedAlias;
  chatReq: ChatRequest;
  repo: GatewayRepo;
  fetchImpl: typeof fetch;
  clientSignal: AbortSignal;
  attempts: RouteAttempt[];
  now: () => number;
}

/** Route-specific upstream request: real model id, identity line, enforced output cap. */
export function buildUpstreamRequest(chatReq: ChatRequest, resolved: ResolvedAlias, route: Route): ChatRequest {
  const cap = outputCapForRoute(chatReq, route);
  const req: ChatRequest = {
    ...chatReq,
    model: route.model.provider_model,
    messages: injectIdentity(chatReq.messages, resolved.alias, route),
  };
  // The cap is what makes the pre-authorized hold a true upper bound.
  if (chatReq.max_completion_tokens != null || (chatReq.max_tokens == null && route.provider.vendor === "openai")) {
    req.max_completion_tokens = cap;
    delete req.max_tokens;
  } else {
    req.max_tokens = cap;
  }
  return req;
}

export async function openFirstWorkingRoute(o: RunOptions): Promise<OpenedRoute | FailedRoutes> {
  const blocked = await o.repo.blockedCredentials().catch((e) => {
    console.error("[gateway] credential health lookup failed", e);
    return new Set<string>();
  });

  for (const route of o.resolved.routes) {
    if (o.clientSignal.aborted) return { kind: "failed" };
    const t0 = o.now();
    const base = { real_model: route.realModel, provider: route.provider.id };
    const skip = (error: string) => o.attempts.push({ ...base, status: null, error_type: "provider_config", error, ms: o.now() - t0, skipped: true });

    let cred;
    try {
      cred = await o.repo.getProviderKey(route);
    } catch (e) {
      console.error(`[gateway] key lookup failed for ${route.provider.id}`, e);
      skip("upstream key could not be loaded/decrypted");
      continue;
    }
    if (!cred) {
      skip("no upstream API key configured");
      continue;
    }
    if (blocked.has(credentialRef(route.provider.id, cred.id))) {
      skip("credential temporarily blocked after an auth failure (401/403)");
      continue;
    }

    const secret = cred.secret;
    const redact = (text: string) => redactSecrets(text, [secret]);
    const controller = new AbortController();
    const onClientAbort = () => controller.abort();
    o.clientSignal.addEventListener("abort", onClientAbort, { once: true });
    const timer = setTimeout(() => controller.abort(new Error("upstream timeout")), route.provider.timeout_ms);

    try {
      // Race against our own abort too: a stuck connection must not outlive timeout_ms
      // even if the fetch implementation ignores the signal.
      const gen = await raceAbort(getAdapter(route.provider.adapter).open({
        route,
        apiKey: secret,
        request: buildUpstreamRequest(o.chatReq, o.resolved, route),
        signal: controller.signal,
        fetchImpl: o.fetchImpl,
      }), controller.signal);
      const first = await raceAbort(gen.next(), controller.signal);
      clearTimeout(timer);
      o.attempts.push({ ...base, status: 200, error_type: null, error: null, ms: o.now() - t0 });
      return { kind: "opened", route, first, rest: gen, controller, redact };
    } catch (e) {
      clearTimeout(timer);
      o.clientSignal.removeEventListener("abort", onClientAbort);
      if (o.clientSignal.aborted) return { kind: "failed" };

      const timedOut = controller.signal.aborted;
      const err = e instanceof UpstreamError
        ? e
        : new UpstreamError(timedOut ? 504 : 502, timedOut ? "upstream timeout" : String((e as Error)?.message ?? e), true,
            timedOut ? "Upstream model timed out." : "Upstream model unreachable.");
      const errorType = timedOut ? "timeout" : classifyUpstreamStatus(err.status);
      const message = redact(err.message).slice(0, 500);
      o.attempts.push({ ...base, status: err.status, error_type: errorType, error: message, ms: o.now() - t0 });

      if (isCredentialFailure(err.status)) {
        await o.repo
          .blockCredential(route.provider.id, cred.id, err.status, message, o.now() + CREDENTIAL_COOLDOWN_MS)
          .catch((blockErr) => console.error("[gateway] failed to block credential", blockErr));
      }
      if (!err.retryable) {
        return { kind: "failed", fatal: new UpstreamError(err.status, message, false, redact(err.clientMessage)) };
      }
    }
  }
  return { kind: "failed" };
}

function raceAbort<T>(promise: Promise<T>, signal: AbortSignal): Promise<T> {
  if (signal.aborted) return Promise.reject(signal.reason ?? new Error("aborted"));
  return new Promise<T>((resolve, reject) => {
    const onAbort = () => reject(signal.reason ?? new Error("aborted"));
    signal.addEventListener("abort", onAbort, { once: true });
    promise.then(
      (v) => { signal.removeEventListener("abort", onAbort); resolve(v); },
      (e) => { signal.removeEventListener("abort", onAbort); reject(e); },
    );
  });
}
