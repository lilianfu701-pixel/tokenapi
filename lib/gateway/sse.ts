import type { ChatChunk, ChatCompletion, ChatToolCall, Usage } from "./types";

export interface SseEvent {
  event?: string;
  data: string;
}

/** Incremental SSE parser over a byte stream. */
export async function* parseSse(body: ReadableStream<Uint8Array>): AsyncGenerator<SseEvent> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      let sep: number;
      while ((sep = findEventBoundary(buffer)) !== -1) {
        const raw = buffer.slice(0, sep);
        buffer = buffer.slice(sep).replace(/^(\r?\n){1,2}/, "");
        const evt = parseEventBlock(raw);
        if (evt) yield evt;
      }
    }
    buffer += decoder.decode();
    const evt = parseEventBlock(buffer);
    if (evt) yield evt;
  } finally {
    reader.releaseLock();
  }
}

function findEventBoundary(buffer: string) {
  const a = buffer.indexOf("\n\n");
  const b = buffer.indexOf("\r\n\r\n");
  if (a === -1) return b;
  if (b === -1) return a;
  return Math.min(a, b);
}

function parseEventBlock(raw: string): SseEvent | null {
  let event: string | undefined;
  const data: string[] = [];
  for (const line of raw.split(/\r?\n/)) {
    if (!line || line.startsWith(":")) continue;
    const idx = line.indexOf(":");
    const field = idx === -1 ? line : line.slice(0, idx);
    const value = idx === -1 ? "" : line.slice(idx + 1).replace(/^ /, "");
    if (field === "event") event = value;
    else if (field === "data") data.push(value);
  }
  if (!data.length && !event) return null;
  return { event, data: data.join("\n") };
}

const encoder = new TextEncoder();

export function sseData(payload: unknown) {
  return encoder.encode(`data: ${typeof payload === "string" ? payload : JSON.stringify(payload)}\n\n`);
}

export function sseNamed(event: string, payload: unknown) {
  return encoder.encode(`event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`);
}

/** Folds a chunk stream into a single chat.completion (used for non-stream clients). */
export class ChunkAggregator {
  content = "";
  reasoning = "";
  finishReason: string | null = null;
  usage: Usage | null = null;
  private tools = new Map<number, ChatToolCall>();

  push(chunk: ChatChunk) {
    if (chunk.usage) this.usage = chunk.usage;
    for (const choice of chunk.choices ?? []) {
      const d = choice.delta ?? {};
      if (d.content) this.content += d.content;
      if (d.reasoning_content) this.reasoning += d.reasoning_content;
      for (const tc of d.tool_calls ?? []) {
        const cur = this.tools.get(tc.index) ?? { id: "", type: "function" as const, function: { name: "", arguments: "" } };
        if (tc.id) cur.id = tc.id;
        if (tc.function?.name) cur.function.name += tc.function.name;
        if (tc.function?.arguments) cur.function.arguments += tc.function.arguments;
        this.tools.set(tc.index, cur);
      }
      if (choice.finish_reason) this.finishReason = choice.finish_reason;
    }
  }

  get toolCalls(): ChatToolCall[] {
    return [...this.tools.entries()].sort((a, b) => a[0] - b[0]).map(([, v]) => v);
  }

  build(id: string, model: string, created: number, usage: Usage): ChatCompletion {
    const toolCalls = this.toolCalls;
    return {
      id,
      object: "chat.completion",
      created,
      model,
      choices: [
        {
          index: 0,
          message: {
            role: "assistant",
            content: this.content || (toolCalls.length ? null : ""),
            ...(this.reasoning ? { reasoning_content: this.reasoning } : {}),
            ...(toolCalls.length ? { tool_calls: toolCalls } : {}),
          },
          finish_reason: this.finishReason ?? "stop",
        },
      ],
      usage,
    };
  }
}
