// Anthropic Messages <-> internal Chat format, both directions:
//  - outbound (upstream is Anthropic): chatToAnthropicRequest + anthropicEventsToChunks
//  - inbound  (client calls POST /v1/messages): anthropicRequestToChat + AnthropicStreamEncoder

import { UpstreamError } from "../errors";
import type { SseEvent } from "../sse";
import { sseNamed } from "../sse";
import type { ChatChunk, ChatCompletion, ChatContentPart, ChatMessage, ChatRequest, ChatTool, Usage } from "../types";

type Json = Record<string, unknown>;
type Block = Json & { type: string };

// ---------------------------------------------------------------- shared

function textOf(content: ChatMessage["content"]): string {
  if (content == null) return "";
  if (typeof content === "string") return content;
  return content.filter((p) => p.type === "text").map((p) => p.text ?? "").join("");
}

function imageUrlToBlock(url: string): Block {
  const m = /^data:([^;]+);base64,([\s\S]*)$/.exec(url);
  if (m) return { type: "image", source: { type: "base64", media_type: m[1], data: m[2] } };
  return { type: "image", source: { type: "url", url } };
}

function safeJson(text: string): unknown {
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return {};
  }
}

const STOP_TO_FINISH: Record<string, string> = {
  end_turn: "stop",
  stop_sequence: "stop",
  max_tokens: "length",
  tool_use: "tool_calls",
  refusal: "content_filter",
  pause_turn: "stop",
};
const FINISH_TO_STOP: Record<string, string> = {
  stop: "end_turn",
  length: "max_tokens",
  tool_calls: "tool_use",
  content_filter: "refusal",
};

// ---------------------------------------------------------------- outbound

export function chatToAnthropicRequest(req: ChatRequest): Json {
  const system = req.messages
    .filter((m) => m.role === "system" || m.role === "developer")
    .map((m) => textOf(m.content))
    .filter(Boolean)
    .join("\n\n");

  const out: Array<{ role: "user" | "assistant"; content: Block[] }> = [];
  const push = (role: "user" | "assistant", blocks: Block[]) => {
    if (!blocks.length) return;
    const last = out[out.length - 1];
    if (last && last.role === role) last.content.push(...blocks);
    else out.push({ role, content: blocks });
  };

  for (const m of req.messages) {
    if (m.role === "system" || m.role === "developer") continue;
    if (m.role === "tool") {
      push("user", [{ type: "tool_result", tool_use_id: m.tool_call_id ?? "", content: textOf(m.content) }]);
      continue;
    }
    const blocks: Block[] = [];
    if (typeof m.content === "string") {
      if (m.content) blocks.push({ type: "text", text: m.content });
    } else if (Array.isArray(m.content)) {
      for (const p of m.content) {
        if (p.type === "text" && p.text) blocks.push({ type: "text", text: p.text });
        else if (p.type === "image_url" && p.image_url?.url) blocks.push(imageUrlToBlock(p.image_url.url));
      }
    }
    if (m.role === "assistant") {
      for (const tc of m.tool_calls ?? []) {
        blocks.push({ type: "tool_use", id: tc.id, name: tc.function.name, input: safeJson(tc.function.arguments) });
      }
      push("assistant", blocks);
    } else {
      push("user", blocks);
    }
  }

  const body: Json = {
    model: req.model,
    messages: out,
    max_tokens: req.max_tokens ?? req.max_completion_tokens ?? 4096,
    stream: true,
  };
  if (system) body.system = system;
  if (req.temperature != null) body.temperature = req.temperature;
  if (req.top_p != null) body.top_p = req.top_p;
  if (req.stop) body.stop_sequences = Array.isArray(req.stop) ? req.stop : [req.stop];
  if (req.tools?.length) {
    body.tools = req.tools.map((t) => ({
      name: t.function.name,
      description: t.function.description,
      input_schema: t.function.parameters ?? { type: "object", properties: {} },
    }));
    const tc = mapToolChoiceToAnthropic(req.tool_choice);
    if (tc) body.tool_choice = tc;
  }
  if (req.user) body.metadata = { user_id: req.user };
  // Extension point: Anthropic-only request fields (e.g. thinking) ride in req.extensions.anthropic.
  return { ...body, ...(req.extensions?.anthropic ?? {}) };
}

function mapToolChoiceToAnthropic(choice: unknown): Json | null {
  if (choice === "auto") return { type: "auto" };
  if (choice === "none") return { type: "none" };
  if (choice === "required") return { type: "any" };
  const fn = (choice as { function?: { name?: string } } | undefined)?.function?.name;
  return fn ? { type: "tool", name: fn } : null;
}

export async function* anthropicEventsToChunks(events: AsyncIterable<SseEvent>): AsyncGenerator<ChatChunk> {
  const toolIndexByBlock = new Map<number, number>();
  let nextTool = 0;
  let input = 0;
  let cacheRead = 0;
  let cacheWrite = 0;
  let output = 0;
  let finish: string | null = null;

  for await (const evt of events) {
    if (!evt.data) continue;
    const d = safeJson(evt.data) as Json;
    const type = (d.type as string) ?? evt.event;

    if (type === "message_start") {
      const u = ((d.message as Json)?.usage ?? {}) as Json;
      input = Number(u.input_tokens ?? 0);
      cacheRead = Number(u.cache_read_input_tokens ?? 0);
      cacheWrite = Number(u.cache_creation_input_tokens ?? 0);
      output = Number(u.output_tokens ?? 0);
      yield { choices: [{ index: 0, delta: { role: "assistant", content: "" }, finish_reason: null }] };
    } else if (type === "content_block_start") {
      const block = d.content_block as Block;
      if (block?.type === "tool_use") {
        const idx = nextTool++;
        toolIndexByBlock.set(Number(d.index), idx);
        yield {
          choices: [{
            index: 0,
            delta: { tool_calls: [{ index: idx, id: String(block.id), type: "function", function: { name: String(block.name), arguments: "" } }] },
            finish_reason: null,
          }],
        };
      } else if (block?.type === "text" && block.text) {
        yield { choices: [{ index: 0, delta: { content: String(block.text) }, finish_reason: null }] };
      }
    } else if (type === "content_block_delta") {
      const delta = d.delta as Json;
      if (delta?.type === "text_delta") {
        yield { choices: [{ index: 0, delta: { content: String(delta.text ?? "") }, finish_reason: null }] };
      } else if (delta?.type === "input_json_delta") {
        const idx = toolIndexByBlock.get(Number(d.index)) ?? 0;
        yield { choices: [{ index: 0, delta: { tool_calls: [{ index: idx, function: { arguments: String(delta.partial_json ?? "") } }] }, finish_reason: null }] };
      } else if (delta?.type === "thinking_delta") {
        yield { choices: [{ index: 0, delta: { reasoning_content: String(delta.thinking ?? "") }, finish_reason: null }] };
      }
    } else if (type === "message_delta") {
      const delta = d.delta as Json;
      if (delta?.stop_reason) finish = STOP_TO_FINISH[String(delta.stop_reason)] ?? "stop";
      const u = (d.usage ?? {}) as Json;
      if (u.output_tokens != null) output = Number(u.output_tokens);
      if (u.input_tokens != null) input = Number(u.input_tokens);
    } else if (type === "error") {
      const err = d.error as Json | undefined;
      throw new UpstreamError(502, String(err?.message ?? "Anthropic stream error"), true);
    }
  }

  const prompt = input + cacheRead + cacheWrite;
  yield { choices: [{ index: 0, delta: {}, finish_reason: finish ?? "stop" }] };
  yield {
    choices: [],
    usage: { prompt_tokens: prompt, completion_tokens: output, total_tokens: prompt + output, cached_tokens: cacheRead },
  };
}

// ---------------------------------------------------------------- inbound

function blocksToParts(blocks: Block[]): ChatContentPart[] {
  const parts: ChatContentPart[] = [];
  for (const b of blocks) {
    if (b.type === "text") parts.push({ type: "text", text: String(b.text ?? "") });
    else if (b.type === "image") {
      const src = b.source as Json;
      const url = src?.type === "base64" ? `data:${src.media_type};base64,${src.data}` : String(src?.url ?? "");
      if (url) parts.push({ type: "image_url", image_url: { url } });
    }
  }
  return parts;
}

function toolResultText(content: unknown): string {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) return (content as Block[]).filter((b) => b.type === "text").map((b) => String(b.text ?? "")).join("");
  return "";
}

/**
 * Current limits: `thinking` and per-block `cache_control` are dropped. Extension point:
 * copy them into `req.extensions.anthropic` here; the Anthropic adapter already merges that
 * object into the upstream body, and other adapters never send it.
 */
export function anthropicRequestToChat(body: Json): ChatRequest {
  if (!Array.isArray(body.messages)) throw new Error("messages must be an array");
  const messages: ChatMessage[] = [];

  const system = typeof body.system === "string" ? body.system : Array.isArray(body.system) ? toolResultText(body.system) : "";
  if (system) messages.push({ role: "system", content: system });

  for (const m of body.messages as Array<{ role: string; content: unknown }>) {
    const blocks: Block[] = typeof m.content === "string" ? [{ type: "text", text: m.content }] : ((m.content as Block[]) ?? []);
    if (m.role === "assistant") {
      const text = blocks.filter((b) => b.type === "text").map((b) => String(b.text ?? "")).join("");
      const toolCalls = blocks
        .filter((b) => b.type === "tool_use")
        .map((b) => ({ id: String(b.id), type: "function" as const, function: { name: String(b.name), arguments: JSON.stringify(b.input ?? {}) } }));
      messages.push({ role: "assistant", content: text || (toolCalls.length ? null : ""), ...(toolCalls.length ? { tool_calls: toolCalls } : {}) });
      continue;
    }
    for (const b of blocks.filter((x) => x.type === "tool_result")) {
      messages.push({ role: "tool", tool_call_id: String(b.tool_use_id), content: toolResultText(b.content) });
    }
    const parts = blocksToParts(blocks.filter((x) => x.type !== "tool_result"));
    if (parts.length) {
      const onlyText = parts.every((p) => p.type === "text");
      messages.push({ role: "user", content: onlyText ? parts.map((p) => p.text).join("") : parts });
    }
  }

  const req: ChatRequest = {
    model: String(body.model ?? ""),
    messages,
    stream: Boolean(body.stream),
    max_tokens: body.max_tokens as number | undefined,
  };
  if (body.temperature != null) req.temperature = body.temperature as number;
  if (body.top_p != null) req.top_p = body.top_p as number;
  if (Array.isArray(body.stop_sequences)) req.stop = body.stop_sequences as string[];
  if (Array.isArray(body.tools)) {
    req.tools = (body.tools as Json[]).map<ChatTool>((t) => ({
      type: "function",
      function: { name: String(t.name), description: t.description as string | undefined, parameters: t.input_schema as Json },
    }));
  }
  const tc = body.tool_choice as Json | undefined;
  if (tc?.type === "auto") req.tool_choice = "auto";
  else if (tc?.type === "any") req.tool_choice = "required";
  else if (tc?.type === "none") req.tool_choice = "none";
  else if (tc?.type === "tool") req.tool_choice = { type: "function", function: { name: String(tc.name) } };
  const userId = (body.metadata as Json | undefined)?.user_id;
  if (userId) req.user = String(userId);
  return req;
}

export function completionToAnthropicMessage(c: ChatCompletion) {
  const msg = c.choices[0]?.message;
  const content: Block[] = [];
  if (msg?.content) content.push({ type: "text", text: msg.content });
  for (const tc of msg?.tool_calls ?? []) {
    content.push({ type: "tool_use", id: tc.id, name: tc.function.name, input: safeJson(tc.function.arguments) });
  }
  return {
    id: c.id,
    type: "message",
    role: "assistant",
    model: c.model,
    content,
    stop_reason: FINISH_TO_STOP[c.choices[0]?.finish_reason ?? "stop"] ?? "end_turn",
    stop_sequence: null,
    usage: anthropicUsage(c.usage),
  };
}

function anthropicUsage(u: Usage) {
  const cached = u.cached_tokens ?? 0;
  return { input_tokens: u.prompt_tokens - cached, output_tokens: u.completion_tokens, cache_read_input_tokens: cached };
}

/** Re-encodes internal chunks as Anthropic SSE events for /v1/messages streaming clients. */
export class AnthropicStreamEncoder {
  private blockIndex = -1;
  private openBlock: "text" | "tool_use" | null = null;
  private toolBlockByIndex = new Map<number, number>();
  private finish: string | null = null;

  constructor(private readonly id: string, private readonly model: string) {}

  start(): Uint8Array[] {
    return [
      sseNamed("message_start", {
        type: "message_start",
        message: { id: this.id, type: "message", role: "assistant", model: this.model, content: [], stop_reason: null, stop_sequence: null, usage: { input_tokens: 0, output_tokens: 0 } },
      }),
    ];
  }

  private close(): Uint8Array[] {
    if (this.openBlock === null) return [];
    this.openBlock = null;
    return [sseNamed("content_block_stop", { type: "content_block_stop", index: this.blockIndex })];
  }

  chunk(chunk: ChatChunk): Uint8Array[] {
    const out: Uint8Array[] = [];
    for (const choice of chunk.choices ?? []) {
      const d = choice.delta ?? {};
      if (d.content) {
        if (this.openBlock !== "text") {
          out.push(...this.close());
          this.blockIndex++;
          this.openBlock = "text";
          out.push(sseNamed("content_block_start", { type: "content_block_start", index: this.blockIndex, content_block: { type: "text", text: "" } }));
        }
        out.push(sseNamed("content_block_delta", { type: "content_block_delta", index: this.blockIndex, delta: { type: "text_delta", text: d.content } }));
      }
      for (const tc of d.tool_calls ?? []) {
        if (tc.id && !this.toolBlockByIndex.has(tc.index)) {
          out.push(...this.close());
          this.blockIndex++;
          this.openBlock = "tool_use";
          this.toolBlockByIndex.set(tc.index, this.blockIndex);
          out.push(sseNamed("content_block_start", {
            type: "content_block_start",
            index: this.blockIndex,
            content_block: { type: "tool_use", id: tc.id, name: tc.function?.name ?? "", input: {} },
          }));
        }
        const args = tc.function?.arguments;
        if (args) {
          out.push(sseNamed("content_block_delta", {
            type: "content_block_delta",
            index: this.toolBlockByIndex.get(tc.index) ?? this.blockIndex,
            delta: { type: "input_json_delta", partial_json: args },
          }));
        }
      }
      if (choice.finish_reason) this.finish = choice.finish_reason;
    }
    return out;
  }

  end(usage: Usage): Uint8Array[] {
    const u = anthropicUsage(usage);
    return [
      ...this.close(),
      sseNamed("message_delta", {
        type: "message_delta",
        delta: { stop_reason: FINISH_TO_STOP[this.finish ?? "stop"] ?? "end_turn", stop_sequence: null },
        usage: u,
      }),
      sseNamed("message_stop", { type: "message_stop" }),
    ];
  }

  error(message: string): Uint8Array[] {
    return [sseNamed("error", { type: "error", error: { type: "api_error", message } })];
  }
}
