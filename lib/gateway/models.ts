import { PLATFORM_NAME } from "./identity";
import { publicPrices } from "./pricing";
import type { PublicAlias } from "./repo";

const toPerToken = (perMillion: number) => (perMillion / 1_000_000).toFixed(12).replace(/0+$/, "").replace(/\.$/, "");

/**
 * Public model object. Allow-list only: public id, display name, capabilities,
 * context length, public price. Provider, real model and upstream URLs never appear here.
 */
export function toPublicModel({ alias, model }: PublicAlias) {
  const prices = model ? publicPrices(alias, model) : null;
  return {
    id: alias.alias,
    object: "model" as const,
    created: 0,
    owned_by: PLATFORM_NAME.toLowerCase(),
    name: alias.display_name,
    display_name: alias.display_name,
    description: alias.description ?? "",
    capabilities: ["streaming", ...(model?.capabilities ?? [])],
    context_length: model?.context_length ?? null,
    pricing: prices
      ? {
          currency: "USD",
          // per token, as strings (OpenRouter convention) + per 1M for humans
          prompt: toPerToken(prices.input),
          completion: toPerToken(prices.output),
          input_per_million: prices.input,
          output_per_million: prices.output,
        }
      : null,
  };
}
