import type { AdapterKind } from "../types";
import { anthropicAdapter } from "./anthropic";
import { openAICompatibleAdapter } from "./openai-compatible";
import type { ProviderAdapter } from "./types";

const ADAPTERS: Record<AdapterKind, ProviderAdapter> = {
  openai: openAICompatibleAdapter,
  anthropic: anthropicAdapter,
};

export const ADAPTER_KINDS = Object.keys(ADAPTERS) as AdapterKind[];

export function getAdapter(kind: AdapterKind): ProviderAdapter {
  const adapter = ADAPTERS[kind];
  if (!adapter) throw new Error(`Unknown adapter: ${kind}`);
  return adapter;
}
