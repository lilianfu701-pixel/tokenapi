import { API_BASE, CONTACT_EMAIL, type Locale } from "./i18n";

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

const zip = <T, U>(keys: readonly T[], vals: U[]) => keys.map((k, i) => [k, vals[i]] as const);

export const DOCS: Record<Locale, DocsContent> = {
  en: {
    meta: {
      title: "Docs | TokenAPI",
      description:
        "TokenAPI API reference: OpenAI-compatible Chat Completions and Responses, Anthropic-compatible Messages, streaming, errors, billing and limits.",
    },
    subtitle: "API docs",
    eyebrow: "API reference",
    title: "Integrate in two lines: base URL and API key.",
    lead:
      "TokenAPI speaks the OpenAI Chat Completions and Responses formats and the Anthropic Messages format. Use the official SDKs unchanged and pick a model ID from the [model list](/models).",
    sidebarLabel: "Documentation sections",
    endpoints: zip(ENDPOINT_PATHS, [
      ["List models", "Public model IDs with capabilities, context length and prices."],
      ["Retrieve a model", "A single model object."],
      ["Chat Completions", "OpenAI Chat Completions format, streaming and non-streaming."],
      ["Responses", "OpenAI Responses format (stateless), streaming and non-streaming."],
      ["Messages", "Anthropic Messages format, for the Anthropic SDK."],
    ]).map(([[method, path], [title, description]]) => ({ method, path, title, description })),
    errors: zip(ERROR_CODES, [
      "Malformed JSON, missing model/messages, or an unsupported parameter.",
      "Missing, wrong, disabled or expired API key.",
      "Balance cannot cover this request's maximum cost, or the key's spend cap is reached. Top up or lower max_tokens.",
      "This key is restricted to other models.",
      "Unknown or disabled model ID. List valid IDs with GET /v1/models.",
      "Per-key requests-per-minute limit exceeded. Retry after the Retry-After header.",
      "Every backend route for this model failed. Safe to retry.",
    ]).map(([[code, name], detail]) => ({ code, name, detail })),
    sections: [
      {
        id: "quickstart", nav: "Quickstart", kicker: "Quickstart", title: "Base URL",
        blocks: [{ pre: API_BASE }, { p: "All endpoints:" }, { endpoints: true }, { code: "curl", label: "curl" }, { code: "node", label: "Node.js · openai" }, { code: "python", label: "Python · openai" }],
      },
      {
        id: "auth", nav: "Authentication", kicker: "Authentication", title: "Send your key as a Bearer token.",
        blocks: [
          { pre: "Authorization: Bearer sk-tk-…" },
          { p: `The Anthropic-style \`x-api-key\` header is accepted too. Keys start with \`sk-tk-\`, are shown once at creation and can be limited per key (requests per minute, spend cap, allowed models, expiry). Keep keys on the server; never ship them in browser or mobile code. To get a key, email [${CONTACT_EMAIL}](mailto:${CONTACT_EMAIL}).` },
        ],
      },
      {
        id: "models", nav: "Models", kicker: "Models", title: "Stable model IDs.",
        blocks: [
          { p: "Use the `id` from `GET /v1/models` as the `model` parameter. A model ID is a stable product: we may upgrade or re-route the backend that serves it to keep quality and availability high, without any change on your side. Responses always report the model ID you called." },
          { code: "models", label: "GET /v1/models" },
          { p: "`pricing.prompt` / `pricing.completion` are USD per token (strings); `input_per_million` / `output_per_million` are USD per million tokens." },
        ],
      },
      {
        id: "chat", nav: "Chat Completions", kicker: "POST /v1/chat/completions", title: "Chat Completions",
        blocks: [
          { p: "Request and response follow the OpenAI format: `messages` with text and image parts, `tools` / `tool_choice`, `response_format`, `temperature`, `top_p`, `stop`, `max_tokens` or `max_completion_tokens`. Each response carries an `x-request-id` header; include it when contacting support." },
          { p: "If you omit `max_tokens`, the model's maximum output length is applied." },
        ],
      },
      {
        id: "streaming", nav: "Streaming", kicker: "Streaming", title: "Server-sent events",
        blocks: [
          { p: "Set `stream: true`. Chunks arrive as `data:` lines and the stream ends with `data: [DONE]`. Add `stream_options.include_usage` to receive token usage in a final chunk." },
          { code: "stream", label: "Node.js" },
        ],
      },
      {
        id: "responses", nav: "Responses API", kicker: "POST /v1/responses", title: "Responses API",
        blocks: [
          { p: "Supports string or array `input`, `instructions`, function tools, `text.format` (JSON schema) and the full streaming event sequence (`response.output_text.delta`, `response.completed`, …)." },
          { code: "responses", label: "Node.js" },
        ],
      },
      {
        id: "messages", nav: "Anthropic Messages", kicker: "POST /v1/messages", title: "Anthropic Messages",
        blocks: [
          { p: "For code written against the Anthropic SDK. Supports `system`, text and image blocks, `tools` with `tool_use` / `tool_result`, and streaming events. Errors use the Anthropic error shape." },
          { code: "messages", label: "Node.js · @anthropic-ai/sdk" },
        ],
      },
      {
        id: "errors", nav: "Errors", kicker: "Errors", title: "OpenAI-style error objects",
        blocks: [
          { code: "error", label: "Example" },
          { errors: true },
          { p: "Upstream failures are retried on another route automatically before you see an error. A 502 means all routes failed and you were not charged." },
        ],
      },
      {
        id: "billing", nav: "Billing & limits", kicker: "Billing & limits", title: "Prepaid, per token, never overdrawn.",
        blocks: [{
          list: [
            "Prices are per model, in USD per million input and output tokens (see [Models](/models)).",
            "Before a request runs, its maximum possible cost (prompt plus `max_tokens`) is reserved from your balance. If the balance cannot cover it, you get a 402 and nothing is sent upstream.",
            "When the request finishes, you are charged the actual tokens and the rest of the reservation is released immediately.",
            "Requests that fail before the model starts answering (any 4xx/5xx error response) are not charged. If a stream is cancelled or breaks midway, only the tokens already generated are charged.",
            "Rate limits are per API key, in requests per minute; exceeding them returns 429 with `Retry-After`.",
          ],
        }],
      },
      {
        id: "compat", nav: "Compatibility notes", kicker: "Compatibility notes", title: "Not supported yet", note: true,
        blocks: [{
          list: [
            "`/v1/responses`: `previous_response_id` (send the full conversation instead), built-in tools such as `web_search`, and `file_id` inputs.",
            "`/v1/messages`: extended `thinking` and `cache_control` are ignored.",
            "`n > 1` on Chat Completions.",
          ],
        }],
      },
    ],
    contactCta: "Questions? Contact us",
  },

  zh: {
    meta: {
      title: "接入文档 | TokenAPI",
      description:
        "TokenAPI 接口文档：兼容 OpenAI 的 Chat Completions 与 Responses、兼容 Anthropic 的 Messages，以及流式输出、错误码、计费与限额说明。",
    },
    subtitle: "接入文档",
    eyebrow: "接口文档",
    title: "两步接入：\n改 base URL，换 API Key。",
    lead:
      "TokenAPI 支持 OpenAI Chat Completions、Responses 格式和 Anthropic Messages 格式。直接使用官方 SDK，无需改动，从[模型列表](/models)里选一个模型 ID 即可。",
    sidebarLabel: "文档目录",
    endpoints: zip(ENDPOINT_PATHS, [
      ["模型列表", "公开模型 ID 及其能力、上下文长度和价格。"],
      ["查询单个模型", "返回单个模型对象。"],
      ["Chat Completions", "OpenAI Chat Completions 格式，支持流式与非流式。"],
      ["Responses", "OpenAI Responses 格式（无状态），支持流式与非流式。"],
      ["Messages", "Anthropic Messages 格式，供 Anthropic SDK 使用。"],
    ]).map(([[method, path], [title, description]]) => ({ method, path, title, description })),
    errors: zip(ERROR_CODES, [
      "JSON 格式错误、缺少 model / messages，或使用了不支持的参数。",
      "API Key 缺失、错误、已停用或已过期。",
      "余额不足以覆盖本次请求的最高费用，或已达到该 Key 的消费上限。请充值或调小 max_tokens。",
      "该 Key 被限制只能使用其他模型。",
      "模型 ID 不存在或已停用。可通过 GET /v1/models 查看有效 ID。",
      "超过该 Key 每分钟请求数限制。请按 Retry-After 响应头的时间后重试。",
      "该模型的所有后端路由都失败了，可以安全重试。",
    ]).map(([[code, name], detail]) => ({ code, name, detail })),
    sections: [
      {
        id: "quickstart", nav: "快速开始", kicker: "快速开始", title: "Base URL",
        blocks: [{ pre: API_BASE }, { p: "全部接口：" }, { endpoints: true }, { code: "curl", label: "curl" }, { code: "node", label: "Node.js · openai" }, { code: "python", label: "Python · openai" }],
      },
      {
        id: "auth", nav: "鉴权", kicker: "鉴权", title: "以 Bearer Token 方式携带 Key。",
        blocks: [
          { pre: "Authorization: Bearer sk-tk-…" },
          { p: `也支持 Anthropic 风格的 \`x-api-key\` 请求头。Key 以 \`sk-tk-\` 开头，只在创建时显示一次，每个 Key 可单独设置限制（每分钟请求数、消费上限、可用模型、有效期）。请只在服务端保存 Key，切勿放进网页或移动端代码。申请 Key 请发邮件至 [${CONTACT_EMAIL}](mailto:${CONTACT_EMAIL})。` },
        ],
      },
      {
        id: "models", nav: "模型", kicker: "模型", title: "稳定的模型 ID",
        blocks: [
          { p: "把 `GET /v1/models` 返回的 `id` 作为 `model` 参数传入。模型 ID 是一个稳定的产品：为保证质量和可用性，我们可能升级或切换它背后的后端，而你这边无需任何改动。响应中返回的始终是你调用的模型 ID。" },
          { code: "models", label: "GET /v1/models" },
          { p: "`pricing.prompt` / `pricing.completion` 为每 token 美元价格（字符串）；`input_per_million` / `output_per_million` 为每百万 token 美元价格。" },
        ],
      },
      {
        id: "chat", nav: "Chat Completions", kicker: "POST /v1/chat/completions", title: "Chat Completions",
        blocks: [
          { p: "请求和响应遵循 OpenAI 格式：支持含文本和图片的 `messages`、`tools` / `tool_choice`、`response_format`、`temperature`、`top_p`、`stop`、`max_tokens` 或 `max_completion_tokens`。每个响应都带有 `x-request-id` 响应头，联系售后时请提供。" },
          { p: "不传 `max_tokens` 时，按该模型的最大输出长度执行。" },
        ],
      },
      {
        id: "streaming", nav: "流式输出", kicker: "流式输出", title: "Server-Sent Events",
        blocks: [
          { p: "设置 `stream: true`。数据以 `data:` 行逐块返回，并以 `data: [DONE]` 结束。加上 `stream_options.include_usage` 可在最后一块中拿到 token 用量。" },
          { code: "stream", label: "Node.js" },
        ],
      },
      {
        id: "responses", nav: "Responses API", kicker: "POST /v1/responses", title: "Responses API",
        blocks: [
          { p: "支持字符串或数组形式的 `input`、`instructions`、函数工具、`text.format`（JSON Schema），以及完整的流式事件序列（`response.output_text.delta`、`response.completed` 等）。" },
          { code: "responses", label: "Node.js" },
        ],
      },
      {
        id: "messages", nav: "Anthropic Messages", kicker: "POST /v1/messages", title: "Anthropic Messages",
        blocks: [
          { p: "适用于基于 Anthropic SDK 编写的代码。支持 `system`、文本和图片块、带 `tool_use` / `tool_result` 的 `tools`，以及流式事件。错误按 Anthropic 的错误格式返回。" },
          { code: "messages", label: "Node.js · @anthropic-ai/sdk" },
        ],
      },
      {
        id: "errors", nav: "错误码", kicker: "错误码", title: "OpenAI 风格的错误对象",
        blocks: [
          { code: "error", label: "示例" },
          { errors: true },
          { p: "上游失败会先自动切换到其他路由重试，之后才会返回错误。返回 502 表示所有路由都失败了，且不会扣费。" },
        ],
      },
      {
        id: "billing", nav: "计费与限额", kicker: "计费与限额", title: "预充值、按 token 计费、绝不透支。",
        blocks: [{
          list: [
            "每个模型单独定价，单位为美元 / 百万输入、输出 token（见[模型](/models)）。",
            "请求执行前，会从余额中冻结其最高可能费用（提示词 + `max_tokens`）。余额不足时返回 402，请求不会发往上游。",
            "请求结束后按实际 token 扣费，剩余冻结额度立即返还。",
            "在模型开始回答之前就失败的请求（任何 4xx/5xx 错误响应）不扣费。流式请求如中途取消或中断，只对已生成的 token 计费。",
            "速率限制按 API Key 计算，单位为每分钟请求数；超出时返回 429 并带 `Retry-After` 响应头。",
          ],
        }],
      },
      {
        id: "compat", nav: "兼容性说明", kicker: "兼容性说明", title: "暂不支持", note: true,
        blocks: [{
          list: [
            "`/v1/responses`：`previous_response_id`（请改为发送完整对话）、`web_search` 等内置工具，以及 `file_id` 输入。",
            "`/v1/messages`：扩展思考 `thinking` 和 `cache_control` 会被忽略。",
            "Chat Completions 的 `n > 1`。",
          ],
        }],
      },
    ],
    contactCta: "有疑问？联系我们",
  },
};
