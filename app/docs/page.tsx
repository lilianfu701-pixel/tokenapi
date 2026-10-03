import type { Metadata } from "next";
import Link from "next/link";
import { API_BASE, CONTACT_EMAIL, SiteFooter, SiteHeader } from "../_site/site-chrome";

export const metadata: Metadata = {
  title: "Docs | TokenAPI",
  description:
    "TokenAPI API reference: OpenAI-compatible Chat Completions and Responses, Anthropic-compatible Messages, streaming, errors, billing and limits.",
};

const docNav = [
  { label: "Quickstart", href: "#quickstart" },
  { label: "Authentication", href: "#auth" },
  { label: "Models", href: "#models" },
  { label: "Chat Completions", href: "#chat" },
  { label: "Streaming", href: "#streaming" },
  { label: "Responses API", href: "#responses" },
  { label: "Anthropic Messages", href: "#messages" },
  { label: "Errors", href: "#errors" },
  { label: "Billing & limits", href: "#billing" },
  { label: "Compatibility notes", href: "#compat" },
] as const;

const endpoints = [
  { method: "GET", path: "/v1/models", title: "List models", description: "Public model IDs with capabilities, context length and prices." },
  { method: "GET", path: "/v1/models/{id}", title: "Retrieve a model", description: "A single model object." },
  { method: "POST", path: "/v1/chat/completions", title: "Chat Completions", description: "OpenAI Chat Completions format, streaming and non-streaming." },
  { method: "POST", path: "/v1/responses", title: "Responses", description: "OpenAI Responses format (stateless), streaming and non-streaming." },
  { method: "POST", path: "/v1/messages", title: "Messages", description: "Anthropic Messages format, for the Anthropic SDK." },
] as const;

const errors = [
  { code: "400", name: "invalid_request_error", detail: "Malformed JSON, missing model/messages, or an unsupported parameter." },
  { code: "401", name: "invalid_api_key", detail: "Missing, wrong, disabled or expired API key." },
  { code: "402", name: "insufficient_quota", detail: "Balance cannot cover this request's maximum cost, or the key's spend cap is reached. Top up or lower max_tokens." },
  { code: "403", name: "model_not_allowed", detail: "This key is restricted to other models." },
  { code: "404", name: "model_not_found", detail: "Unknown or disabled model ID. List valid IDs with GET /v1/models." },
  { code: "429", name: "rate_limit_exceeded", detail: "Per-key requests-per-minute limit exceeded. Retry after the Retry-After header." },
  { code: "502", name: "upstream_unavailable", detail: "Every backend route for this model failed. Safe to retry." },
] as const;

const code = {
  curl: `curl ${API_BASE}/chat/completions \\
  -H "Authorization: Bearer $TOKENAPI_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "premium-model",
    "messages": [{ "role": "user", "content": "Hello!" }]
  }'`,
  node: `import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "${API_BASE}",
  apiKey: process.env.TOKENAPI_KEY,
});

const res = await client.chat.completions.create({
  model: "premium-model",
  messages: [{ role: "user", content: "Hello!" }],
});
console.log(res.choices[0].message.content);`,
  python: `import os
from openai import OpenAI

client = OpenAI(base_url="${API_BASE}", api_key=os.environ["TOKENAPI_KEY"])

res = client.chat.completions.create(
    model="premium-model",
    messages=[{"role": "user", "content": "Hello!"}],
)
print(res.choices[0].message.content)`,
  stream: `const stream = await client.chat.completions.create({
  model: "premium-model",
  messages: [{ role: "user", content: "Write a haiku." }],
  stream: true,
  stream_options: { include_usage: true }, // final chunk carries usage
});

for await (const chunk of stream) {
  process.stdout.write(chunk.choices[0]?.delta?.content ?? "");
}`,
  responses: `const res = await client.responses.create({
  model: "premium-model",
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
  model: "premium-model",
  max_tokens: 1024,
  messages: [{ role: "user", content: "Hello!" }],
});`,
  models: `{
  "object": "list",
  "data": [
    {
      "id": "premium-model",
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

function Code({ label, children }: { label: string; children: string }) {
  return (
    <figure className="code-block">
      <figcaption>{label}</figcaption>
      <pre>{children}</pre>
    </figure>
  );
}

export default function DocsPage() {
  return (
    <main className="site-shell">
      <SiteHeader subtitle="API docs" />

      <section className="page-hero" id="overview">
        <span className="eyebrow">API reference</span>
        <h1>Integrate in two lines: base URL and API key.</h1>
        <p>
          TokenAPI speaks the OpenAI Chat Completions and Responses formats and the Anthropic Messages format. Use the
          official SDKs unchanged and pick a model ID from the <Link href="/models">model list</Link>.
        </p>
      </section>

      <div className="docs-grid">
        <aside className="docs-sidebar" aria-label="Documentation sections">
          {docNav.map((item) => <a key={item.href} href={item.href}>{item.label}</a>)}
        </aside>

        <div className="docs-content">
          <section className="docs-card" id="quickstart">
            <span className="docs-kicker">Quickstart</span>
            <h2>Base URL</h2>
            <pre>{API_BASE}</pre>
            <p>All endpoints:</p>
            <div className="endpoint-table">
              {endpoints.map((e) => (
                <article key={e.path} className="endpoint-row">
                  <span>{e.method}</span>
                  <code>{e.path}</code>
                  <div>
                    <h3>{e.title}</h3>
                    <p>{e.description}</p>
                  </div>
                </article>
              ))}
            </div>
            <Code label="curl">{code.curl}</Code>
            <Code label="Node.js · openai">{code.node}</Code>
            <Code label="Python · openai">{code.python}</Code>
          </section>

          <section className="docs-card" id="auth">
            <span className="docs-kicker">Authentication</span>
            <h2>Send your key as a Bearer token.</h2>
            <pre>Authorization: Bearer sk-tk-…</pre>
            <p>
              The Anthropic-style <code>x-api-key</code> header is accepted too. Keys start with <code>sk-tk-</code>, are shown
              once at creation and can be limited per key (requests per minute, spend cap, allowed models, expiry). Keep keys
              on the server; never ship them in browser or mobile code. To get a key, email{" "}
              <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
            </p>
          </section>

          <section className="docs-card" id="models">
            <span className="docs-kicker">Models</span>
            <h2>Stable model IDs.</h2>
            <p>
              Use the <code>id</code> from <code>GET /v1/models</code> as the <code>model</code> parameter. A model ID is a
              stable product: we may upgrade or re-route the backend that serves it to keep quality and availability high,
              without any change on your side. Responses always report the model ID you called.
            </p>
            <Code label="GET /v1/models">{code.models}</Code>
            <p>
              <code>pricing.prompt</code> / <code>pricing.completion</code> are USD per token (strings);{" "}
              <code>input_per_million</code> / <code>output_per_million</code> are USD per million tokens.
            </p>
          </section>

          <section className="docs-card" id="chat">
            <span className="docs-kicker">POST /v1/chat/completions</span>
            <h2>Chat Completions</h2>
            <p>
              Request and response follow the OpenAI format: <code>messages</code> with text and image parts,{" "}
              <code>tools</code> / <code>tool_choice</code>, <code>response_format</code>, <code>temperature</code>,{" "}
              <code>top_p</code>, <code>stop</code>, <code>max_tokens</code> or <code>max_completion_tokens</code>. Each response
              carries an <code>x-request-id</code> header; include it when contacting support.
            </p>
            <p>
              If you omit <code>max_tokens</code>, the model&apos;s maximum output length is applied.
            </p>
          </section>

          <section className="docs-card" id="streaming">
            <span className="docs-kicker">Streaming</span>
            <h2>Server-sent events</h2>
            <p>
              Set <code>stream: true</code>. Chunks arrive as <code>data:</code> lines and the stream ends with{" "}
              <code>data: [DONE]</code>. Add <code>stream_options.include_usage</code> to receive token usage in a final chunk.
            </p>
            <Code label="Node.js">{code.stream}</Code>
          </section>

          <section className="docs-card" id="responses">
            <span className="docs-kicker">POST /v1/responses</span>
            <h2>Responses API</h2>
            <p>
              Supports string or array <code>input</code>, <code>instructions</code>, function tools,{" "}
              <code>text.format</code> (JSON schema) and the full streaming event sequence (
              <code>response.output_text.delta</code>, <code>response.completed</code>, …).
            </p>
            <Code label="Node.js">{code.responses}</Code>
          </section>

          <section className="docs-card" id="messages">
            <span className="docs-kicker">POST /v1/messages</span>
            <h2>Anthropic Messages</h2>
            <p>
              For code written against the Anthropic SDK. Supports <code>system</code>, text and image blocks,{" "}
              <code>tools</code> with <code>tool_use</code> / <code>tool_result</code>, and streaming events. Errors use the
              Anthropic error shape.
            </p>
            <Code label="Node.js · @anthropic-ai/sdk">{code.messages}</Code>
          </section>

          <section className="docs-card" id="errors">
            <span className="docs-kicker">Errors</span>
            <h2>OpenAI-style error objects</h2>
            <Code label="Example">{code.error}</Code>
            <div className="error-grid">
              {errors.map((e) => (
                <article key={e.code}>
                  <strong>{e.code}</strong>
                  <code>{e.name}</code>
                  <p>{e.detail}</p>
                </article>
              ))}
            </div>
            <p>
              Upstream failures are retried on another route automatically before you see an error. A 502 means all routes
              failed and you were not charged.
            </p>
          </section>

          <section className="docs-card" id="billing">
            <span className="docs-kicker">Billing & limits</span>
            <h2>Prepaid, per token, never overdrawn.</h2>
            <ul className="docs-list">
              <li>Prices are per model, in USD per million input and output tokens (see <Link href="/models">Models</Link>).</li>
              <li>Before a request runs, its maximum possible cost (prompt plus <code>max_tokens</code>) is reserved from your balance. If the balance cannot cover it, you get a 402 and nothing is sent upstream.</li>
              <li>When the request finishes, you are charged the actual tokens and the rest of the reservation is released immediately.</li>
              <li>Requests that fail before the model starts answering (any 4xx/5xx error response) are not charged. If a stream is cancelled or breaks midway, only the tokens already generated are charged.</li>
              <li>Rate limits are per API key, in requests per minute; exceeding them returns 429 with <code>Retry-After</code>.</li>
            </ul>
          </section>

          <section className="docs-card launch-note" id="compat">
            <span className="docs-kicker">Compatibility notes</span>
            <h2>Not supported yet</h2>
            <ul className="docs-list">
              <li><code>/v1/responses</code>: <code>previous_response_id</code> (send the full conversation instead), built-in tools such as <code>web_search</code>, and <code>file_id</code> inputs.</li>
              <li><code>/v1/messages</code>: extended <code>thinking</code> and <code>cache_control</code> are ignored.</li>
              <li><code>n &gt; 1</code> on Chat Completions.</li>
            </ul>
            <a className="button button-primary" href={`mailto:${CONTACT_EMAIL}`}>Questions? Contact us</a>
          </section>
        </div>
      </div>

      <SiteFooter />
    </main>
  );
}
