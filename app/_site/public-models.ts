import { toPublicModel } from "@/lib/gateway/models";
import type { AliasRow, ModelRow } from "@/lib/gateway/types";

/**
 * Static snapshot of the public TokenAPI aliases from scripts/seed-gateway-routing.mjs
 * (price multiplier 1.3, primary route only). The models page used to query Neon on
 * every request. The live deployment could not be read back (it is disabled, and this
 * repo has no database URL), so the seeded catalog is what the page renders.
 */
const MULTIPLIER = 1.3;

interface SeedModel {
  provider: string;
  id: string;
  name: string;
  context: number;
  input: number;
  output: number;
  cache: number;
  capabilities: string[];
}

const MODELS: Record<string, SeedModel> = {
  "alibaba/qwen3.8-flash": {
    provider: "alibaba",
    id: "qwen3.8-flash",
    name: "Qwen3.8 Flash",
    context: 1_000_000,
    input: 0.15,
    output: 0.47,
    cache: 0.016,
    capabilities: ["tools", "vision", "json_output", "reasoning"],
  },
  "alibaba/qwen3.7-plus": {
    provider: "alibaba",
    id: "qwen3.7-plus",
    name: "Qwen3.7 Plus",
    context: 1_000_000,
    input: 0.4,
    output: 1.6,
    cache: 0.04,
    capabilities: ["tools", "vision", "json_output", "reasoning"],
  },
  "alibaba/qwen3.8-max": {
    provider: "alibaba",
    id: "qwen3.8-max",
    name: "Qwen3.8 Max",
    context: 1_000_000,
    input: 2,
    output: 6,
    cache: 0.25,
    capabilities: ["tools", "vision", "json_output", "reasoning"],
  },
  "deepseek/deepseek-v4-pro": {
    provider: "deepseek",
    id: "deepseek-v4-pro",
    name: "DeepSeek V4 Pro",
    context: 1_000_000,
    input: 0.66,
    output: 1.98,
    cache: 0.022,
    capabilities: ["tools", "json_output", "reasoning"],
  },
};

function toAlias(alias: string, displayName: string, description: string, route: string): AliasRow {
  const slash = route.indexOf("/");
  return {
    id: alias,
    alias,
    display_name: displayName,
    description,
    provider: route.slice(0, slash),
    provider_model: route.slice(slash + 1),
    api_base: null,
    api_key_id: null,
    price_multiplier: MULTIPLIER,
    public_input_price: null,
    public_output_price: null,
    inject_identity: true,
    enabled: true,
  };
}

function toModel(route: string): ModelRow {
  const model = MODELS[route];
  return {
    provider_id: model.provider,
    provider_model: model.id,
    display_name: model.name,
    context_length: model.context,
    max_output_tokens: null,
    capabilities: model.capabilities,
    input_price: model.input,
    output_price: model.output,
    cache_read_price: model.cache,
    enabled: true,
  };
}

const ALIASES = [
  ["tokenapi-fast", "TokenAPI Fast", "Fast and low-cost for everyday tasks, classification and batch jobs.", "alibaba/qwen3.8-flash"],
  ["tokenapi-plus", "TokenAPI Plus", "Balanced quality and price; the default choice for most applications.", "alibaba/qwen3.7-plus"],
  ["tokenapi-pro", "TokenAPI Pro", "Flagship quality for complex tasks, coding and long context.", "alibaba/qwen3.8-max"],
  ["tokenapi-think", "TokenAPI Think", "Reasoning-first model that thinks before it answers.", "deepseek/deepseek-v4-pro"],
] as const;

export const PUBLIC_MODELS = ALIASES.map(([alias, name, description, route]) =>
  toPublicModel({ alias: toAlias(alias, name, description, route), model: toModel(route) }),
);
