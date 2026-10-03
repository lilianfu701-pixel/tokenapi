// Builds app/_site/model-catalog.json: a reference catalog of first-party mainstream models
// (official names, context, official list prices) from models.dev (MIT licensed).
//
//   node scripts/build-model-catalog.mjs            # fetch live
//   node scripts/build-model-catalog.mjs file.json  # use a downloaded api.json
//
// This is a display catalog only. It does not create gateway routes or aliases.

import { readFileSync, writeFileSync } from "node:fs";

const SOURCE = "https://models.dev/api.json";
const OUT = "app/_site/model-catalog.json";
const SINCE = "2025-01"; // only current generations

// First-party vendors only, in display order. `keep` filters out models a vendor merely hosts.
const VENDORS = [
  { id: "openai", en: "OpenAI", zh: "OpenAI" },
  { id: "anthropic", en: "Anthropic", zh: "Anthropic" },
  { id: "google", en: "Google", zh: "Google", drop: /lyria|veo|imagen|music/i },
  { id: "xai", en: "xAI", zh: "xAI" },
  { id: "deepseek", en: "DeepSeek", zh: "DeepSeek 深度求索" },
  { id: "alibaba", en: "Alibaba Qwen", zh: "阿里 通义千问", keep: /qwen|qwq|qvq/i },
  { id: "moonshotai", en: "Moonshot AI (Kimi)", zh: "月之暗面 Kimi" },
  { id: "zhipuai", en: "Zhipu AI (GLM)", zh: "智谱 GLM" },
  { id: "volcengine", en: "ByteDance Doubao (Volcengine)", zh: "字节跳动 豆包（火山引擎）", keep: /seed|doubao/i },
  { id: "minimax", en: "MiniMax", zh: "MiniMax 稀宇科技" },
  { id: "stepfun", en: "StepFun", zh: "阶跃星辰" },
  { id: "mistral", en: "Mistral AI", zh: "Mistral AI", keep: /mistral|magistral|codestral|devstral|ministral|pixtral/i },
  { id: "meta", en: "Meta", zh: "Meta", drop: /contributor/i },
  { id: "cohere", en: "Cohere", zh: "Cohere" },
];

const NON_CHAT = /embed|tts|whisper|moderation|image|dall-?e|realtime|audio|transcri|search|rerank|ocr|speech|asr/i;

const data = process.argv[2] ? JSON.parse(readFileSync(process.argv[2], "utf8")) : await (await fetch(SOURCE)).json();

const vendors = [];
for (const v of VENDORS) {
  const raw = Object.entries(data[v.id]?.models ?? {});
  const seen = new Set();
  const models = raw
    .map(([id, m]) => ({ id, ...m }))
    .filter((m) => m.status !== "deprecated")
    .filter((m) => m.cost && m.cost.input != null && m.cost.output != null)
    .filter((m) => (m.modalities?.output ?? ["text"]).includes("text"))
    .filter((m) => !NON_CHAT.test(`${m.id} ${m.name}`))
    .filter((m) => !/\(latest\)|\blatest\b/i.test(m.name) && !/-latest$/.test(m.id))
    .filter((m) => !v.keep || v.keep.test(`${m.id} ${m.name}`))
    .filter((m) => !v.drop || !v.drop.test(`${m.id} ${m.name} ${m.family ?? ""}`))
    .filter((m) => (m.release_date || m.last_updated || "") >= SINCE)
    .sort((a, b) => (b.release_date || "").localeCompare(a.release_date || "") || a.name.localeCompare(b.name))
    .filter((m) => (seen.has(m.name) ? false : (seen.add(m.name), true)))
    .map((m) => ({
      id: m.id,
      name: m.name,
      released: (m.release_date || "").slice(0, 7) || null,
      context: m.limit?.context ?? null,
      input: m.cost.input,
      output: m.cost.output,
      reasoning: Boolean(m.reasoning),
      tools: Boolean(m.tool_call),
      vision: (m.modalities?.input ?? []).includes("image"),
      openWeights: Boolean(m.open_weights),
    }));
  if (models.length) vendors.push({ id: v.id, en: v.en, zh: v.zh, models });
}

const catalog = { source: "models.dev", sourceUrl: "https://models.dev", generated: new Date().toISOString().slice(0, 10), vendors };
writeFileSync(OUT, `${JSON.stringify(catalog, null, 1)}\n`);
console.log(`wrote ${OUT}: ${vendors.length} vendors, ${vendors.reduce((n, v) => n + v.models.length, 0)} models`);
for (const v of vendors) console.log(`  ${v.en.padEnd(30)} ${String(v.models.length).padStart(3)}  ${v.models.slice(0, 4).map((m) => m.name).join(" / ")}`);
