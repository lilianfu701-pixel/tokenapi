import type { AliasRow, ChatRequest, ModelRow, Route, Usage } from "./types";

// All money is integer micro-USD (1 USD = 1_000_000 microusd). Prices are USD per 1M tokens,
// so price * tokens is already microusd: (price * tokens / 1e6) USD * 1e6.

export const DEFAULT_MAX_OUTPUT_TOKENS = 8192;

function microusd(pricePerMillion: number, tokens: number) {
  return Number(pricePerMillion) * tokens;
}

/** What the upstream provider charges us. */
export function upstreamCostMicrousd(model: ModelRow, usage: Usage) {
  const cached = Math.min(usage.cached_tokens ?? 0, usage.prompt_tokens);
  const uncached = usage.prompt_tokens - cached;
  const cachePrice = model.cache_read_price ?? model.input_price;
  return Math.ceil(
    microusd(model.input_price, uncached) + microusd(cachePrice, cached) + microusd(model.output_price, usage.completion_tokens),
  );
}

/**
 * What we bill the customer. Fixed public prices (if set on the alias) keep the
 * customer price stable when the backend is re-routed; otherwise cost x multiplier.
 */
export function customerChargeMicrousd(alias: AliasRow, model: ModelRow, usage: Usage) {
  if (alias.public_input_price != null && alias.public_output_price != null) {
    return Math.ceil(microusd(alias.public_input_price, usage.prompt_tokens) + microusd(alias.public_output_price, usage.completion_tokens));
  }
  return Math.ceil(upstreamCostMicrousd(model, usage) * Number(alias.price_multiplier));
}

/** Public price per 1M tokens for /v1/models listing. */
export function publicPrices(alias: AliasRow, model: ModelRow) {
  if (alias.public_input_price != null && alias.public_output_price != null) {
    return { input: Number(alias.public_input_price), output: Number(alias.public_output_price) };
  }
  const m = Number(alias.price_multiplier);
  return { input: Number(model.input_price) * m, output: Number(model.output_price) * m };
}

/** Output tokens the client asked for, if any. */
export function requestedMaxOutput(req: ChatRequest): number | null {
  const v = req.max_completion_tokens ?? req.max_tokens;
  return typeof v === "number" && v > 0 ? Math.floor(v) : null;
}

/** Output cap actually enforced upstream for a route (so the hold is a real upper bound). */
export function outputCapForRoute(req: ChatRequest, route: Route) {
  const modelCap = route.model.max_output_tokens ?? DEFAULT_MAX_OUTPUT_TOKENS;
  const asked = requestedMaxOutput(req);
  return asked ? Math.min(asked, modelCap) : modelCap;
}

const IMAGE_TOKENS_UPPER = 2000;
const PER_MESSAGE_OVERHEAD = 8;
const SAFETY_MARGIN = 1.25;

/** Deliberately pessimistic prompt-size estimate used only for pre-authorization. */
export function estimatePromptTokensUpper(req: ChatRequest, extraSystemText = "") {
  let tokens = estimateTokens(extraSystemText) + PER_MESSAGE_OVERHEAD;
  for (const m of req.messages) {
    tokens += PER_MESSAGE_OVERHEAD;
    if (typeof m.content === "string") tokens += estimateTokens(m.content, 3);
    else if (Array.isArray(m.content)) {
      for (const p of m.content) tokens += p.type === "image_url" ? IMAGE_TOKENS_UPPER : estimateTokens(String(p.text ?? JSON.stringify(p)), 3);
    }
    for (const tc of m.tool_calls ?? []) tokens += estimateTokens(tc.function.name + tc.function.arguments, 3);
  }
  if (req.tools) tokens += estimateTokens(JSON.stringify(req.tools), 3);
  return Math.ceil(tokens * SAFETY_MARGIN);
}

/** Max over all routes (any of them may end up serving): the amount to pre-authorize. */
export function holdMicrousd(alias: AliasRow, routes: Route[], req: ChatRequest, promptUpper: number) {
  let max = 0;
  for (const route of routes) {
    const usage = { prompt_tokens: promptUpper, completion_tokens: outputCapForRoute(req, route), total_tokens: 0, cached_tokens: 0 };
    max = Math.max(max, customerChargeMicrousd(alias, route.model, usage));
  }
  return max;
}

/** Token estimate: CJK ~1 char/token, other text ~`charsPerToken` chars/token. */
export function estimateTokens(text: string, charsPerToken = 4) {
  if (!text) return 0;
  const cjk = (text.match(/[　-鿿가-힯]/g) ?? []).length;
  return Math.ceil(cjk + (text.length - cjk) / charsPerToken);
}

export function formatUsd(value: number) {
  const sign = value < 0 ? "-" : "";
  return `${sign}$${(Math.abs(value) / 1_000_000).toFixed(6).replace(/0{1,4}$/, "")}`;
}

/** Decimal USD string/number from a form -> integer microusd, without float drift. */
export function usdToMicrousd(usd: number | string) {
  const s = String(usd).trim();
  const m = /^(-)?(\d+)(?:\.(\d{1,6}))?$/.exec(s);
  if (!m) throw new Error(`Invalid USD amount: ${s}`);
  const value = Number(m[2]) * 1_000_000 + Number((m[3] ?? "").padEnd(6, "0"));
  return m[1] ? -value : value;
}
