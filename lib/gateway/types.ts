// Internal lingua franca = OpenAI Chat Completions format.
// Every inbound API (chat / responses / messages) is translated INTO this,
// every upstream adapter translates OUT of it.

export type ChatRole = "system" | "developer" | "user" | "assistant" | "tool";

export interface ChatContentPart {
  type: "text" | "image_url" | string;
  text?: string;
  image_url?: { url: string; detail?: string };
  [key: string]: unknown;
}

export interface ChatToolCall {
  id: string;
  type: "function";
  function: { name: string; arguments: string };
}

export interface ChatMessage {
  role: ChatRole;
  content: string | ChatContentPart[] | null;
  name?: string;
  tool_calls?: ChatToolCall[];
  tool_call_id?: string;
}

export interface ChatTool {
  type: "function";
  function: { name: string; description?: string; parameters?: Record<string, unknown> };
}

export interface ChatRequest {
  model: string;
  messages: ChatMessage[];
  stream?: boolean;
  max_tokens?: number;
  max_completion_tokens?: number;
  temperature?: number;
  top_p?: number;
  stop?: string | string[];
  tools?: ChatTool[];
  tool_choice?: unknown;
  response_format?: unknown;
  user?: string;
  /**
   * Vendor-specific passthrough that only the matching adapter may read (never sent to
   * other providers). Extension point for e.g. Anthropic thinking / cache_control.
   */
  extensions?: { anthropic?: Record<string, unknown> };
  [key: string]: unknown;
}

export interface Usage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  cached_tokens?: number;
}

export interface ChatChunkDelta {
  role?: "assistant";
  content?: string | null;
  reasoning_content?: string | null;
  tool_calls?: Array<{
    index: number;
    id?: string;
    type?: "function";
    function?: { name?: string; arguments?: string };
  }>;
}

export interface ChatChunk {
  id?: string;
  object?: "chat.completion.chunk";
  created?: number;
  model?: string;
  choices: Array<{ index: number; delta: ChatChunkDelta; finish_reason: string | null }>;
  usage?: Usage | null;
}

export interface ChatCompletion {
  id: string;
  object: "chat.completion";
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: "assistant";
      content: string | null;
      reasoning_content?: string;
      tool_calls?: ChatToolCall[];
    };
    finish_reason: string | null;
  }>;
  usage: Usage;
}

// ---------- routing / config rows ----------

export type AdapterKind = "openai" | "anthropic";

export interface ProviderRow {
  id: string;
  name: string;
  vendor: string;
  adapter: AdapterKind;
  api_base: string;
  extra_headers: Record<string, string>;
  timeout_ms: number;
  enabled: boolean;
}

export interface ModelRow {
  provider_id: string;
  provider_model: string;
  display_name: string;
  context_length: number | null;
  max_output_tokens: number | null;
  capabilities: string[];
  input_price: number;
  output_price: number;
  cache_read_price: number | null;
  enabled: boolean;
}

export interface AliasRow {
  id: string;
  alias: string;
  display_name: string;
  description: string | null;
  provider: string;
  provider_model: string;
  api_base: string | null;
  api_key_id: string | null;
  price_multiplier: number;
  public_input_price: number | null;
  public_output_price: number | null;
  inject_identity: boolean;
  enabled: boolean;
}

export interface FallbackRow {
  alias_id: string;
  priority: number;
  provider: string;
  provider_model: string;
  api_base: string | null;
  api_key_id: string | null;
  enabled: boolean;
}

/** A fully-resolved upstream target: everything an adapter needs. */
export interface Route {
  provider: ProviderRow;
  model: ModelRow;
  apiBase: string;
  apiKeyId: string | null;
  /** "qwen/qwen-max" — the permanent real_model identity. */
  realModel: string;
}

export interface ResolvedAlias {
  alias: AliasRow;
  routes: Route[];
}

/** Balance / spend caps are enforced atomically in the DB (gateway_reserve_credit), not here. */
export interface ApiKeyContext {
  keyId: string;
  userId: string;
  rpmLimit: number;
  allowedAliases: string[] | null;
}

/** Upstream credential as resolved for one call. `id` = gateway_provider_keys.id or "env". */
export interface ProviderCredential {
  id: string;
  secret: string;
}

export const MODEL_CAPABILITIES = ["tools", "vision", "json_output", "reasoning"] as const;
