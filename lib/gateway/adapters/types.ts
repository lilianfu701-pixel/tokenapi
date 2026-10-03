import type { ChatChunk, ChatRequest, Route } from "../types";

export interface AdapterCall {
  route: Route;
  apiKey: string;
  /** Already rewritten: model = provider_model, identity injected. */
  request: ChatRequest;
  signal: AbortSignal;
  fetchImpl: typeof fetch;
}

/**
 * Resolves once the upstream accepted the request (2xx headers) so the caller can
 * still fall back; rejects with UpstreamError otherwise. Always streams internally.
 */
export interface ProviderAdapter {
  open(call: AdapterCall): Promise<AsyncGenerator<ChatChunk>>;
}
