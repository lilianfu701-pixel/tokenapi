import type { AliasRow, ChatMessage, Route } from "./types";

export const PLATFORM_NAME = process.env.GATEWAY_PLATFORM_NAME || "TokenAPI";

/**
 * One short line (~35 tokens). Answers identity questions truthfully without the
 * backend's self-knowledge, and tells the model not to volunteer it otherwise.
 */
export function identitySystemPrompt(alias: AliasRow, route: Route) {
  return `Product model: ${alias.display_name}. Backend: ${route.model.display_name} (${route.provider.name}). If asked about model identity, state both accurately; otherwise do not mention them.`;
}

/** Prepend as the first system message; the user's own system prompts follow untouched. */
export function injectIdentity(messages: ChatMessage[], alias: AliasRow, route: Route): ChatMessage[] {
  if (!alias.inject_identity) return messages;
  return [{ role: "system", content: identitySystemPrompt(alias, route) }, ...messages];
}
