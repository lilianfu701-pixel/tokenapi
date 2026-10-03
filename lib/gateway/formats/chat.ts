import { GatewayError } from "../errors";
import { sseData } from "../sse";
import type { ChatChunk, ChatRequest, Usage } from "../types";

type Json = Record<string, unknown>;

export function chatRequestFromBody(body: Json): ChatRequest {
  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    throw new GatewayError(400, "invalid_messages", "messages must be a non-empty array.");
  }
  // stream_options is the gateway's concern (we always request upstream usage).
  const req: ChatRequest = { ...(body as ChatRequest), stream: Boolean(body.stream) };
  delete req.stream_options;
  return req;
}

export function wantsStreamUsage(body: Json) {
  return Boolean((body.stream_options as Json | undefined)?.include_usage);
}

/**
 * Re-emits upstream chunks to the client with OUR id / public model name.
 * Upstream usage chunks are swallowed; usage is emitted once at the end only
 * if the client asked for it (stream_options.include_usage), matching OpenAI.
 */
export class ChatStreamEncoder {
  constructor(
    private readonly id: string,
    private readonly model: string,
    private readonly created: number,
    private readonly includeUsage: boolean,
  ) {}

  start(): Uint8Array[] {
    return [];
  }

  chunk(chunk: ChatChunk): Uint8Array[] {
    if (!chunk.choices?.length) return [];
    return [sseData({ id: this.id, object: "chat.completion.chunk", created: this.created, model: this.model, choices: chunk.choices })];
  }

  end(usage: Usage): Uint8Array[] {
    const out: Uint8Array[] = [];
    if (this.includeUsage) {
      out.push(sseData({ id: this.id, object: "chat.completion.chunk", created: this.created, model: this.model, choices: [], usage }));
    }
    out.push(sseData("[DONE]"));
    return out;
  }

  error(message: string): Uint8Array[] {
    return [sseData({ error: { message, type: "upstream_error", code: "upstream_error" } }), sseData("[DONE]")];
  }
}
