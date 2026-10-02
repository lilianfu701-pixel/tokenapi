import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "TokenAPI Docs | AI Model Pricing API Reference",
  description:
    "API reference for TokenAPI: query AI model pricing, capabilities, and provider data. Covers /models, /providers, /compare, and /search endpoints.",
};

const docNav = [
  { label: "Overview", href: "#overview" },
  { label: "Base URL", href: "#base-url" },
  { label: "Endpoints", href: "#endpoints" },
  { label: "Filtering", href: "#filtering" },
  { label: "Response format", href: "#response-format" },
  { label: "Errors", href: "#errors" },
] as const;

const endpointRows = [
  {
    method: "GET",
    path: "/api/v1/models",
    title: "List models",
    description:
      "Paginated list of all AI models. Supports filtering by provider, capabilities, cost, and context window.",
    example: `curl "https://tokenapi.biz/api/v1/models?provider=anthropic&reasoning=true&limit=5"`,
  },
  {
    method: "GET",
    path: "/api/v1/models/{provider}/{id}",
    title: "Model detail",
    description:
      "Full detail for a single model including all pricing fields, capabilities, modalities, and provider metadata.",
    example: `curl "https://tokenapi.biz/api/v1/models/openai/gpt-5"`,
  },
  {
    method: "GET",
    path: "/api/v1/providers",
    title: "List providers",
    description:
      "All providers with model counts, SDK package names, API endpoints, and documentation links.",
    example: `curl "https://tokenapi.biz/api/v1/providers"`,
  },
  {
    method: "GET",
    path: "/api/v1/providers/{id}",
    title: "Provider detail",
    description:
      "Provider metadata plus all models under that provider.",
    example: `curl "https://tokenapi.biz/api/v1/providers/anthropic"`,
  },
  {
    method: "GET",
    path: "/api/v1/compare",
    title: "Compare models",
    description:
      "Side-by-side comparison of 2–10 models. Pass comma-separated provider/model IDs.",
    example: `curl "https://tokenapi.biz/api/v1/compare?ids=openai/gpt-5,anthropic/claude-sonnet-5-5"`,
  },
  {
    method: "GET",
    path: "/api/v1/search",
    title: "Search",
    description:
      "Full-text search across model names, descriptions, families, and providers. Supports capability filters.",
    example: `curl "https://tokenapi.biz/api/v1/search?q=claude&capability=reasoning"`,
  },
] as const;

const filterParams = [
  { param: "provider", type: "string", description: "Filter by provider ID (e.g. openai, anthropic)" },
  { param: "reasoning", type: "boolean", description: "Models with reasoning capability" },
  { param: "tool_call", type: "boolean", description: "Models with tool/function calling" },
  { param: "attachment", type: "boolean", description: "Models that accept file attachments" },
  { param: "open_weights", type: "boolean", description: "Open-weight models only" },
  { param: "family", type: "string", description: "Model family (e.g. claude, gpt)" },
  { param: "min_context", type: "integer", description: "Minimum context window size" },
  { param: "max_cost_input", type: "number", description: "Maximum input cost per million tokens (USD)" },
  { param: "sort", type: "string", description: "Sort field: cost_input, cost_output, context_limit, name, release_date" },
  { param: "order", type: "string", description: "Sort direction: asc (default) or desc" },
  { param: "page", type: "integer", description: "Page number (default: 1)" },
  { param: "limit", type: "integer", description: "Results per page (default: 50, max: 200)" },
] as const;

const errorRows = [
  { code: "400", name: "INVALID_PARAM", detail: "A query parameter is missing, malformed, or out of range." },
  { code: "404", name: "NOT_FOUND", detail: "The requested model or provider does not exist." },
  { code: "500", name: "DB_ERROR", detail: "An internal database error occurred." },
] as const;

export default function DocsPage() {
  return (
    <main className="docs-shell">
      <header className="docs-header">
        <Link className="brand" href="/" aria-label="Back to TokenAPI home">
          <span className="brand-mark" aria-hidden="true">
            T
          </span>
          <span>
            <strong>TokenAPI</strong>
            <small>API docs</small>
          </span>
        </Link>
        <a className="button button-secondary" href="mailto:hello@tokenapi.biz">
          Contact us
        </a>
      </header>

      <section className="docs-hero" id="overview">
        <span className="eyebrow">API Reference</span>
        <h1>AI model pricing data, one REST call away.</h1>
        <p>
          TokenAPI provides structured access to 4,900+ AI models from 60+
          providers. Query pricing, context limits, capabilities, and compare
          models programmatically. No API key required during beta.
        </p>
      </section>

      <div className="docs-grid">
        <aside className="docs-sidebar" aria-label="Documentation sections">
          {docNav.map((item) => (
            <a key={item.href} href={item.href}>
              {item.label}
            </a>
          ))}
        </aside>

        <div className="docs-content">
          <section className="docs-card" id="base-url">
            <span className="docs-kicker">Base URL</span>
            <h2>All requests go to tokenapi.biz</h2>
            <pre>https://tokenapi.biz/api/v1</pre>
            <p>
              CORS is enabled for all origins. No authentication is required
              during the beta period. Responses are JSON with a consistent
              envelope format.
            </p>
          </section>

          <section className="docs-card" id="endpoints">
            <span className="docs-kicker">Endpoints</span>
            <h2>Six endpoints cover the full catalog.</h2>
            <div className="endpoint-table">
              {endpointRows.map((endpoint) => (
                <article key={endpoint.path} className="endpoint-row">
                  <span>{endpoint.method}</span>
                  <code>{endpoint.path}</code>
                  <div>
                    <h3>{endpoint.title}</h3>
                    <p>{endpoint.description}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="docs-card" id="filtering">
            <span className="docs-kicker">Query parameters</span>
            <h2>Filter, sort, and paginate the model list.</h2>
            <p>
              The <code>/api/v1/models</code> endpoint accepts these query
              parameters. All are optional.
            </p>
            <div className="endpoint-table">
              {filterParams.map((p) => (
                <article key={p.param} className="endpoint-row">
                  <span style={{ background: "var(--amber)" }}>{p.type}</span>
                  <code>{p.param}</code>
                  <div>
                    <p>{p.description}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="docs-card" id="response-format">
            <span className="docs-kicker">Response format</span>
            <h2>Consistent JSON envelope on every response.</h2>
            <div className="response-grid">
              <div>
                <h3>Success response</h3>
                <p>
                  Every successful response wraps data in a <code>success: true</code> envelope.
                  Paginated endpoints include a <code>meta</code> object with total count and page info.
                </p>
              </div>
              <pre>{`{
  "success": true,
  "data": [ ... ],
  "meta": {
    "total": 4914,
    "page": 1,
    "limit": 50,
    "has_more": true
  }
}`}</pre>
            </div>
          </section>

          <section className="docs-card" id="errors">
            <span className="docs-kicker">Error responses</span>
            <h2>Errors are machine-readable with consistent codes.</h2>
            <pre>{`{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Model openai/nonexistent not found"
  }
}`}</pre>
            <div className="error-grid">
              {errorRows.map((error) => (
                <article key={error.code}>
                  <strong>{error.code}</strong>
                  <code>{error.name}</code>
                  <p>{error.detail}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="docs-card launch-note">
            <span className="docs-kicker">Beta status</span>
            <h2>The API is live. Data syncs daily from models.dev.</h2>
            <p>
              The catalog endpoint is production-ready. Phase 2 will add API key
              authentication, price history tracking, Chinese model supplements,
              and cost estimation tools. Request early access to get notified.
            </p>
            <a className="button button-primary" href="mailto:hello@tokenapi.biz">
              Contact us
            </a>
          </section>
        </div>
      </div>
    </main>
  );
}
