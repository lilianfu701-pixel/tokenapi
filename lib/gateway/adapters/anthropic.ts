import { networkError, upstreamErrorFromResponse } from "../errors";
import { anthropicEventsToChunks, chatToAnthropicRequest } from "../formats/anthropic";
import { parseSse } from "../sse";
import type { AdapterCall, ProviderAdapter } from "./types";

const ANTHROPIC_VERSION = "2023-06-01";

export const anthropicAdapter: ProviderAdapter = {
  async open({ route, apiKey, request, signal, fetchImpl }: AdapterCall) {
    const url = `${route.apiBase.replace(/\/+$/, "")}/messages`;
    let res: Response;
    try {
      res = await fetchImpl(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": ANTHROPIC_VERSION,
          ...route.provider.extra_headers,
        },
        body: JSON.stringify(chatToAnthropicRequest(request)),
        signal,
      });
    } catch (e) {
      if (signal.aborted) throw e;
      throw networkError(route.provider.id, e);
    }
    if (!res.ok || !res.body) {
      // includes Anthropic 529 overloaded -> retryable
      throw await upstreamErrorFromResponse(route.provider.id, res);
    }
    return anthropicEventsToChunks(parseSse(res.body));
  },
};
