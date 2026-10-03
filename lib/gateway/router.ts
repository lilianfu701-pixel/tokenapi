import type { AliasRow, FallbackRow, ModelRow, ProviderRow, ResolvedAlias, Route } from "./types";

/**
 * Pure routing: alias + fallback rows + provider/model catalog -> ordered usable routes.
 * Knows nothing about vendors; changing premium-model from Qwen to Gemini is a data change only.
 */
export function buildRoutes(
  alias: AliasRow,
  fallbacks: FallbackRow[],
  providers: Map<string, ProviderRow>,
  models: Map<string, ModelRow>,
): ResolvedAlias {
  const candidates = [
    { provider: alias.provider, provider_model: alias.provider_model, api_base: alias.api_base, api_key_id: alias.api_key_id, enabled: true },
    ...[...fallbacks].sort((a, b) => a.priority - b.priority),
  ];

  const seen = new Set<string>();
  const routes: Route[] = [];
  for (const c of candidates) {
    if (!c.enabled) continue;
    const provider = providers.get(c.provider);
    const model = models.get(modelKey(c.provider, c.provider_model));
    if (!provider?.enabled || !model?.enabled) continue;
    const apiBase = c.api_base || provider.api_base;
    const dedupe = `${c.provider}|${c.provider_model}|${apiBase}|${c.api_key_id ?? ""}`;
    if (seen.has(dedupe)) continue;
    seen.add(dedupe);
    routes.push({
      provider,
      model,
      apiBase,
      apiKeyId: c.api_key_id,
      realModel: `${provider.id}/${model.provider_model}`,
    });
  }
  return { alias, routes };
}

export function modelKey(providerId: string, providerModel: string) {
  return `${providerId}/${providerModel}`;
}
