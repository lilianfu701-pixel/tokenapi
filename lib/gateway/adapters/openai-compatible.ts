import { UpstreamError, networkError, upstreamErrorFromResponse } from "../errors";
import { parseSse } from "../sse";
import type { ChatChunk, Usage } from "../types";
import type { AdapterCall, ProviderAdapter } from "./types";

// Covers OpenAI, Qwen (DashScope compatible-mode), DeepSeek, Gemini (OpenAI endpoint),
// Moonshot and any other OpenAI-compatible API.

export const openAICompatibleAdapter: ProviderAdapter = {
  async open({ route, apiKey, request, signal, fetchImpl }: AdapterCall) {
    const url = `${route.apiBase.replace(/\/+$/, "")}/chat/completions`;
    // `extensions` are vendor-specific and never leave the gateway on this adapter.
    const { extensions: _extensions, ...rest } = request;
    void _extensions;
    const body = { ...rest, stream: true, stream_options: { include_usage: true } };

    let res: Response;
    try {
      res = await fetchImpl(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
          ...route.provider.extra_headers,
        },
        body: JSON.stringify(body),
        signal,
      });
    } catch (e) {
      if (signal.aborted) throw e;
      throw networkError(route.provider.id, e);
    }

    if (!res.ok || !res.body) {
      throw await upstreamErrorFromResponse(route.provider.id, res);
    }
    return readChunks(res.body);
  },
};

async function* readChunks(body: ReadableStream<Uint8Array>): AsyncGenerator<ChatChunk> {
  for await (const evt of parseSse(body)) {
    if (!evt.data || evt.data === "[DONE]") continue;
    let parsed: ChatChunk & { error?: { message?: string } };
    try {
      parsed = JSON.parse(evt.data);
    } catch {
      continue;
    }
    // Retryable: if this happens before the first chunk, the next route is tried.
    if (parsed.error) throw new UpstreamError(502, parsed.error.message ?? "Upstream stream error", true);
    yield { ...parsed, choices: parsed.choices ?? [], usage: normalizeUsage(parsed.usage) };
  }
}

/** Different vendors report cache hits differently; fold into cached_tokens. */
export function normalizeUsage(raw: unknown): Usage | null {
  if (!raw || typeof raw !== "object") return null;
  const u = raw as Record<string, unknown>;
  const prompt = Number(u.prompt_tokens ?? 0);
  const completion = Number(u.completion_tokens ?? 0);
  const details = u.prompt_tokens_details as { cached_tokens?: number } | undefined;
  const cached = Number(details?.cached_tokens ?? u.prompt_cache_hit_tokens ?? u.cached_tokens ?? 0);
  return {
    prompt_tokens: prompt,
    completion_tokens: completion,
    total_tokens: Number(u.total_tokens ?? prompt + completion),
    cached_tokens: cached,
  };
}
