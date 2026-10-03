// OpenAI Responses API (POST /v1/responses) <-> internal Chat format.
// Stateless subset: text, images, function tools, structured output.
// previous_response_id and built-in tools (web_search, ...) are rejected unless the
// corresponding ResponsesHooks are supplied — that is the extension point for later.

import { randomBytes } from "node:crypto";
import { GatewayError } from "../errors";
import { sseNamed } from "../sse";
import type { ChatChunk, ChatCompletion, ChatContentPart, ChatMessage, ChatRequest, ChatTool, ChatToolCall, Usage } from "../types";

type Json = Record<string, unknown>;

const rid = (prefix: string) => `${prefix}_${randomBytes(12).toString("hex")}`;

function partsFromContent(content: unknown): string | ChatContentPart[] {
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return "";
  const parts: ChatContentPart[] = [];
  for (const p of content as Json[]) {
    if (p.type === "input_text" || p.type === "output_text" || p.type === "text") parts.push({ type: "text", text: String(p.text ?? "") });
    else if (p.type === "input_image") {
      const url = typeof p.image_url === "string" ? p.image_url : (p.image_url as Json | undefined)?.url;
      if (!url) throw new GatewayError(400, "unsupported_input", "input_image requires image_url (file_id is not supported).");
      parts.push({ type: "image_url", image_url: { url: String(url), detail: p.detail as string | undefined } });
    } else {
      throw new GatewayError(400, "unsupported_input", `Unsupported input content type: ${String(p.type)}`);
    }
  }
  return parts.every((p) => p.type === "text") ? parts.map((p) => p.text).join("") : parts;
}

export interface ResponsesHooks {
  /** Load prior turns for previous_response_id (needs a response store; not implemented yet). */
  loadConversation?: (previousResponseId: string) => Promise<ChatMessage[]>;
  /** Map a built-in tool (e.g. web_search) onto a gateway-executed function tool (not implemented yet). */
  builtinTool?: (tool: Json) => ChatTool | null;
}

export async function responsesRequestToChatWithHooks(body: Json, hooks: ResponsesHooks = {}): Promise<ChatRequest> {
  const prev = typeof body.previous_response_id === "string" ? body.previous_response_id : null;
  if (prev && !hooks.loadConversation) {
    throw new GatewayError(400, "unsupported_parameter", "previous_response_id is not supported; send the full conversation in input.");
  }
  const req = responsesRequestToChat({ ...body, previous_response_id: undefined }, hooks);
  if (prev && hooks.loadConversation) {
    const history = await hooks.loadConversation(prev);
    const systems = req.messages.filter((m) => m.role === "system");
    req.messages = [...systems, ...history, ...req.messages.filter((m) => m.role !== "system")];
  }
  return req;
}

export function responsesRequestToChat(body: Json, hooks: ResponsesHooks = {}): ChatRequest {
  if (body.previous_response_id) {
    throw new GatewayError(400, "unsupported_parameter", "previous_response_id is not supported; send the full conversation in input.");
  }
  const messages: ChatMessage[] = [];
  if (typeof body.instructions === "string" && body.instructions) messages.push({ role: "system", content: body.instructions });

  if (typeof body.input === "string") {
    messages.push({ role: "user", content: body.input });
  } else if (Array.isArray(body.input)) {
    for (const item of body.input as Json[]) {
      const type = item.type ?? "message";
      if (type === "message") {
        const role = String(item.role ?? "user") as ChatMessage["role"];
        messages.push({ role: role === "developer" ? "system" : role, content: partsFromContent(item.content) });
      } else if (type === "function_call") {
        const call: ChatToolCall = { id: String(item.call_id), type: "function", function: { name: String(item.name), arguments: String(item.arguments ?? "") } };
        const last = messages[messages.length - 1];
        if (last?.role === "assistant" && last.tool_calls) last.tool_calls.push(call);
        else messages.push({ role: "assistant", content: null, tool_calls: [call] });
      } else if (type === "function_call_output") {
        messages.push({ role: "tool", tool_call_id: String(item.call_id), content: typeof item.output === "string" ? item.output : JSON.stringify(item.output) });
      } else if (type === "reasoning") {
        continue;
      } else {
        throw new GatewayError(400, "unsupported_input", `Unsupported input item type: ${String(type)}`);
      }
    }
  } else {
    throw new GatewayError(400, "invalid_input", "input must be a string or an array.");
  }

  const req: ChatRequest = { model: String(body.model ?? ""), messages, stream: Boolean(body.stream) };
  if (body.max_output_tokens != null) req.max_tokens = Number(body.max_output_tokens);
  if (body.temperature != null) req.temperature = Number(body.temperature);
  if (body.top_p != null) req.top_p = Number(body.top_p);
  if (body.user) req.user = String(body.user);

  if (Array.isArray(body.tools) && body.tools.length) {
    req.tools = (body.tools as Json[]).map((t) => {
      if (t.type !== "function") {
        const mapped = hooks.builtinTool?.(t);
        if (mapped) return mapped;
        throw new GatewayError(400, "unsupported_tool", `Built-in tool "${String(t.type)}" is not supported; use function tools.`);
      }
      return { type: "function" as const, function: { name: String(t.name), description: t.description as string | undefined, parameters: t.parameters as Json } };
    });
  }
  const tc = body.tool_choice;
  if (typeof tc === "string") req.tool_choice = tc;
  else if (tc && typeof tc === "object" && (tc as Json).type === "function") req.tool_choice = { type: "function", function: { name: String((tc as Json).name) } };

  const format = (body.text as Json | undefined)?.format as Json | undefined;
  if (format?.type === "json_schema") {
    req.response_format = { type: "json_schema", json_schema: { name: format.name ?? "response", schema: format.schema, strict: format.strict } };
  } else if (format?.type === "json_object") {
    req.response_format = { type: "json_object" };
  }
  return req;
}

// ---------------------------------------------------------------- output

interface OutputState {
  text: string;
  messageId: string | null;
  messageIndex: number;
  tools: Array<{ itemId: string; callId: string; name: string; args: string; outputIndex: number }>;
}

function usageOut(u: Usage) {
  return {
    input_tokens: u.prompt_tokens,
    input_tokens_details: { cached_tokens: u.cached_tokens ?? 0 },
    output_tokens: u.completion_tokens,
    output_tokens_details: { reasoning_tokens: 0 },
    total_tokens: u.total_tokens,
  };
}

function outputItems(state: OutputState, status: "completed" | "in_progress") {
  const items: Array<[number, Json]> = [];
  if (state.messageId) {
    items.push([state.messageIndex, {
      id: state.messageId,
      type: "message",
      status,
      role: "assistant",
      content: [{ type: "output_text", text: state.text, annotations: [] }],
    }]);
  }
  for (const t of state.tools) {
    items.push([t.outputIndex, { id: t.itemId, type: "function_call", status, call_id: t.callId, name: t.name, arguments: t.args }]);
  }
  return items.sort((a, b) => a[0] - b[0]).map(([, item]) => item);
}

function responseObject(id: string, model: string, created: number, req: Json, state: OutputState, finish: string | null, usage: Usage | null) {
  const incomplete = finish === "length";
  return {
    id,
    object: "response",
    created_at: created,
    status: usage ? (incomplete ? "incomplete" : "completed") : "in_progress",
    error: null,
    incomplete_details: incomplete ? { reason: "max_output_tokens" } : null,
    instructions: req.instructions ?? null,
    max_output_tokens: req.max_output_tokens ?? null,
    model,
    output: usage ? outputItems(state, "completed") : [],
    output_text: state.text,
    parallel_tool_calls: true,
    temperature: req.temperature ?? null,
    top_p: req.top_p ?? null,
    tool_choice: req.tool_choice ?? "auto",
    tools: req.tools ?? [],
    metadata: req.metadata ?? {},
    usage: usage ? usageOut(usage) : null,
  };
}

export function completionToResponse(c: ChatCompletion, req: Json) {
  const msg = c.choices[0]?.message;
  const hasText = Boolean(msg?.content);
  const state: OutputState = {
    text: msg?.content ?? "",
    messageId: hasText ? rid("msg") : null,
    messageIndex: 0,
    tools: (msg?.tool_calls ?? []).map((t, i) => ({
      itemId: rid("fc"), callId: t.id, name: t.function.name, args: t.function.arguments, outputIndex: i + (hasText ? 1 : 0),
    })),
  };
  return responseObject(c.id.replace(/^gen-/, "resp_"), c.model, c.created, req, state, c.choices[0]?.finish_reason ?? null, c.usage);
}

/** Emits the Responses streaming event sequence from internal chunks. */
export class ResponsesStreamEncoder {
  private seq = 0;
  private state: OutputState = { text: "", messageId: null, messageIndex: 0, tools: [] };
  private nextOutputIndex = 0;
  private toolSlot = new Map<number, number>();
  private finish: string | null = null;
  private readonly id: string;

  constructor(requestId: string, private readonly model: string, private readonly created: number, private readonly req: Json) {
    this.id = requestId.replace(/^gen-/, "resp_");
  }

  private ev(type: string, payload: Json) {
    return sseNamed(type, { type, sequence_number: this.seq++, ...payload });
  }

  start(): Uint8Array[] {
    const resp = responseObject(this.id, this.model, this.created, this.req, this.state, null, null);
    return [this.ev("response.created", { response: resp }), this.ev("response.in_progress", { response: resp })];
  }

  chunk(chunk: ChatChunk): Uint8Array[] {
    const out: Uint8Array[] = [];
    for (const choice of chunk.choices ?? []) {
      const d = choice.delta ?? {};
      if (d.content) {
        if (!this.state.messageId) {
          this.state.messageId = rid("msg");
          this.state.messageIndex = this.nextOutputIndex++;
          out.push(this.ev("response.output_item.added", {
            output_index: this.state.messageIndex,
            item: { id: this.state.messageId, type: "message", status: "in_progress", role: "assistant", content: [] },
          }));
          out.push(this.ev("response.content_part.added", {
            item_id: this.state.messageId, output_index: this.state.messageIndex, content_index: 0,
            part: { type: "output_text", text: "", annotations: [] },
          }));
        }
        this.state.text += d.content;
        out.push(this.ev("response.output_text.delta", { item_id: this.state.messageId, output_index: this.state.messageIndex, content_index: 0, delta: d.content }));
      }
      for (const tc of d.tool_calls ?? []) {
        let slot = this.toolSlot.get(tc.index);
        if (slot === undefined) {
          slot = this.state.tools.length;
          this.toolSlot.set(tc.index, slot);
          const t = { itemId: rid("fc"), callId: tc.id ?? rid("call"), name: tc.function?.name ?? "", args: "", outputIndex: this.nextOutputIndex++ };
          this.state.tools.push(t);
          out.push(this.ev("response.output_item.added", {
            output_index: t.outputIndex,
            item: { id: t.itemId, type: "function_call", status: "in_progress", call_id: t.callId, name: t.name, arguments: "" },
          }));
        }
        const t = this.state.tools[slot];
        const args = tc.function?.arguments;
        if (args) {
          t.args += args;
          out.push(this.ev("response.function_call_arguments.delta", { item_id: t.itemId, output_index: t.outputIndex, delta: args }));
        }
      }
      if (choice.finish_reason) this.finish = choice.finish_reason;
    }
    return out;
  }

  end(usage: Usage): Uint8Array[] {
    const out: Uint8Array[] = [];
    if (this.state.messageId) {
      const mi = this.state.messageIndex;
      const part = { type: "output_text", text: this.state.text, annotations: [] };
      out.push(this.ev("response.output_text.done", { item_id: this.state.messageId, output_index: mi, content_index: 0, text: this.state.text }));
      out.push(this.ev("response.content_part.done", { item_id: this.state.messageId, output_index: mi, content_index: 0, part }));
      out.push(this.ev("response.output_item.done", {
        output_index: mi,
        item: { id: this.state.messageId, type: "message", status: "completed", role: "assistant", content: [part] },
      }));
    }
    this.state.tools.forEach((t) => {
      const idx = t.outputIndex;
      out.push(this.ev("response.function_call_arguments.done", { item_id: t.itemId, output_index: idx, arguments: t.args }));
      out.push(this.ev("response.output_item.done", {
        output_index: idx,
        item: { id: t.itemId, type: "function_call", status: "completed", call_id: t.callId, name: t.name, arguments: t.args },
      }));
    });
    const resp = responseObject(this.id, this.model, this.created, this.req, this.state, this.finish, usage);
    out.push(this.ev(resp.status === "incomplete" ? "response.incomplete" : "response.completed", { response: resp }));
    return out;
  }

  error(message: string): Uint8Array[] {
    return [this.ev("error", { code: "upstream_error", message, param: null })];
  }
}
