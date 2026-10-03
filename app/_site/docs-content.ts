import { API_BASE, CONTACT_EMAIL, type Locale } from "./i18n";
import { fmt, getMessages } from "./locales";
import type { DocsText } from "./locales/types";

// Inline markup in strings: `code` and [label](/path or mailto:) — see rich() in i18n.tsx.

export const DOC_CODE = {
  curl: `curl ${API_BASE}/chat/completions \\
  -H "Authorization: Bearer $TOKENAPI_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "tokenapi-pro",
    "messages": [{ "role": "user", "content": "Hello!" }]
  }'`,
  node: `import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "${API_BASE}",
  apiKey: process.env.TOKENAPI_KEY,
});

const res = await client.chat.completions.create({
  model: "tokenapi-pro",
  messages: [{ role: "user", content: "Hello!" }],
});
console.log(res.choices[0].message.content);`,
  python: `import os
from openai import OpenAI

client = OpenAI(base_url="${API_BASE}", api_key=os.environ["TOKENAPI_KEY"])

res = client.chat.completions.create(
    model="tokenapi-pro",
    messages=[{"role": "user", "content": "Hello!"}],
)
print(res.choices[0].message.content)`,
  stream: `const stream = await client.chat.completions.create({
  model: "tokenapi-pro",
  messages: [{ role: "user", content: "Write a haiku." }],
  stream: true,
  stream_options: { include_usage: true }, // final chunk carries usage
});

for await (const chunk of stream) {
  process.stdout.write(chunk.choices[0]?.delta?.content ?? "");
}`,
  responses: `const res = await client.responses.create({
  model: "tokenapi-pro",
  instructions: "Answer in one sentence.",
  input: "What is a token?",
});
console.log(res.output_text);`,
  messages: `import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  baseURL: "https://tokenapi.biz",   // SDK appends /v1/messages
  apiKey: process.env.TOKENAPI_KEY,
});

const msg = await anthropic.messages.create({
  model: "tokenapi-pro",
  max_tokens: 1024,
  messages: [{ role: "user", content: "Hello!" }],
});`,
  models: `{
  "object": "list",
  "data": [
    {
      "id": "tokenapi-pro",
      "object": "model",
      "owned_by": "tokenapi",
      "display_name": "TokenAPI Pro",
      "capabilities": ["streaming", "tools", "json_output"],
      "context_length": 131072,
      "pricing": {
        "currency": "USD",
        "prompt": "0.0000015",
        "completion": "0.000006",
        "input_per_million": 1.5,
        "output_per_million": 6
      }
    }
  ]
}`,
  error: `{
  "error": {
    "message": "The model 'nope' does not exist or is disabled.",
    "type": "invalid_request_error",
    "code": "model_not_found",
    "param": null
  }
}`,
};

type CodeKey = keyof typeof DOC_CODE;

export interface DocSection {
  id: string;
  nav: string;
  kicker: string;
  title: string;
  /** Rendered in order: paragraphs, code blocks, the endpoint table, error grid, bullet list. */
  blocks: Array<
    | { p: string }
    | { pre: string }
    | { code: CodeKey; label: string }
    | { endpoints: true }
    | { errors: true }
    | { list: string[] }
  >;
  note?: boolean;
}

export interface DocsContent {
  meta: { title: string; description: string };
  subtitle: string;
  eyebrow: string;
  title: string;
  lead: string;
  sidebarLabel: string;
  endpoints: Array<{ method: string; path: string; title: string; description: string }>;
  errors: Array<{ code: string; name: string; detail: string }>;
  sections: DocSection[];
  contactCta: string;
}

const ENDPOINT_PATHS = [
  ["GET", "/v1/models"],
  ["GET", "/v1/models/{id}"],
  ["POST", "/v1/chat/completions"],
  ["POST", "/v1/responses"],
  ["POST", "/v1/messages"],
] as const;

const ERROR_CODES = [
  ["400", "invalid_request_error"],
  ["401", "invalid_api_key"],
  ["402", "insufficient_quota"],
  ["403", "model_not_allowed"],
  ["404", "model_not_found"],
  ["429", "rate_limit_exceeded"],
  ["502", "upstream_unavailable"],
] as const;


/** Builds the section structure from a locale's text, so every language has identical structure. */
export function buildDocs(t: DocsText): DocsContent {
  const withEmail = (text: string) => fmt(text, { email: CONTACT_EMAIL });
  return {
    meta: t.meta,
    subtitle: t.subtitle,
    eyebrow: t.eyebrow,
    title: t.title,
    lead: t.lead,
    sidebarLabel: t.sidebarLabel,
    contactCta: t.contactCta,
    endpoints: ENDPOINT_PATHS.map(([method, path], i) => ({ method, path, title: t.endpoints[i][0], description: t.endpoints[i][1] })),
    errors: ERROR_CODES.map(([code, name], i) => ({ code, name, detail: t.errors[i] })),
    sections: [
      {
        id: "quickstart", nav: t.quickstart.nav, kicker: t.quickstart.kicker, title: t.quickstart.title,
        blocks: [
          { pre: API_BASE }, { p: t.quickstart.allEndpoints }, { endpoints: true },
          { code: "curl", label: "curl" }, { code: "node", label: "Node.js · openai" }, { code: "python", label: "Python · openai" },
        ],
      },
      {
        id: "auth", nav: t.auth.nav, kicker: t.auth.kicker, title: t.auth.title,
        blocks: [{ pre: "Authorization: Bearer sk-tk-…" }, { p: withEmail(t.auth.body) }],
      },
      {
        id: "models", nav: t.models.nav, kicker: t.models.kicker, title: t.models.title,
        blocks: [{ p: t.models.body }, { code: "models", label: "GET /v1/models" }, { p: t.models.pricingNote }],
      },
      {
        id: "chat", nav: t.chat.nav, kicker: "POST /v1/chat/completions", title: "Chat Completions",
        blocks: [{ p: t.chat.body }, { p: t.chat.maxTokens }],
      },
      {
        id: "streaming", nav: t.streaming.nav, kicker: t.streaming.kicker, title: t.streaming.title,
        blocks: [{ p: t.streaming.body }, { code: "stream", label: "Node.js" }],
      },
      {
        id: "responses", nav: t.responses.nav, kicker: "POST /v1/responses", title: "Responses API",
        blocks: [{ p: t.responses.body }, { code: "responses", label: "Node.js" }],
      },
      {
        id: "messages", nav: t.messages.nav, kicker: "POST /v1/messages", title: "Anthropic Messages",
        blocks: [{ p: t.messages.body }, { code: "messages", label: "Node.js · @anthropic-ai/sdk" }],
      },
      {
        id: "errors", nav: t.errorsSection.nav, kicker: t.errorsSection.kicker, title: t.errorsSection.title,
        blocks: [{ code: "error", label: t.errorsSection.example }, { errors: true }, { p: t.errorsSection.footer }],
      },
      {
        id: "billing", nav: t.billing.nav, kicker: t.billing.kicker, title: t.billing.title,
        blocks: [{ list: [...t.billing.list] }],
      },
      {
        id: "compat", nav: t.compat.nav, kicker: t.compat.kicker, title: t.compat.title, note: true,
        blocks: [{ list: [...t.compat.list] }],
      },
    ],
  };
}

export function getDocs(locale: Locale): DocsContent {
  return buildDocs(getMessages(locale).docs);
}
