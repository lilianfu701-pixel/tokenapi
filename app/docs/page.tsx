import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "TokenAPI Developer Docs | API reference",
  description:
    "Developer documentation for TokenAPI token profiles, market snapshots, holder signals, webhooks, rate limits, and error responses.",
};

const docNav = [
  { label: "Overview", href: "#overview" },
  { label: "Authentication", href: "#authentication" },
  { label: "Endpoints", href: "#endpoints" },
  { label: "Examples", href: "#examples" },
  { label: "Limits", href: "#limits" },
  { label: "Errors", href: "#errors" },
] as const;

const endpointRows = [
  {
    method: "GET",
    path: "/v1/tokens/{chain}/{address}",
    signature: "GET /v1/tokens/{chain}/{address}",
    title: "Token profile",
    description: "Return normalized metadata, contract details, socials, and verification notes.",
  },
  {
    method: "GET",
    path: "/v1/markets/snapshot",
    signature: "GET /v1/markets/snapshot",
    title: "Market snapshot",
    description: "Return price, liquidity, volume, market cap, and short-window movement.",
  },
  {
    method: "GET",
    path: "/v1/signals/holders",
    signature: "GET /v1/signals/holders",
    title: "Holder signals",
    description: "Return ownership concentration, top holder ranges, and transfer velocity.",
  },
  {
    method: "POST",
    path: "/v1/webhooks",
    signature: "POST /v1/webhooks",
    title: "Webhook subscription",
    description: "Register token events for alerts, monitoring workflows, and agent triggers.",
  },
] as const;

const errorRows = [
  { code: "400", name: "bad_request", detail: "The request is missing a required chain, address, or parameter." },
  { code: "401", name: "unauthorized", detail: "The API key is missing, expired, or malformed." },
  { code: "404", name: "not_found", detail: "The token or chain could not be resolved." },
  { code: "429", name: "rate_limited", detail: "The workspace exceeded its current request quota." },
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
            <small>Developer docs</small>
          </span>
        </Link>
        <Link className="button button-secondary" href="/#contact">
          Request API Access
        </Link>
      </header>

      <section className="docs-hero" id="overview">
        <span className="eyebrow">TokenAPI Developer Docs</span>
        <h1>Build with structured token data before running your own indexers.</h1>
        <p>
          TokenAPI is designed as a clean API layer for token profiles, market snapshots,
          holder signals, webhook alerts, and product-ready crypto data workflows.
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
          <section className="docs-card" id="authentication">
            <span className="docs-kicker">Authentication</span>
            <h2>Use a bearer token for every request.</h2>
            <p>
              API keys will be issued per workspace. Keep live keys server-side and use
              separate keys for production, staging, and local testing.
            </p>
            <pre>{`Authorization: Bearer tk_live_your_workspace_key
Content-Type: application/json`}</pre>
          </section>

          <section className="docs-card" id="endpoints">
            <span className="docs-kicker">Core endpoints</span>
            <h2>Start with four product-facing surfaces.</h2>
            <div className="endpoint-table">
              {endpointRows.map((endpoint) => (
                <article key={endpoint.path} className="endpoint-row">
                  <span>{endpoint.method}</span>
                  <code>{endpoint.signature}</code>
                  <div>
                    <h3>{endpoint.title}</h3>
                    <p>{endpoint.description}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="docs-card" id="examples">
            <span className="docs-kicker">Example request</span>
            <h2>Fetch a token profile by chain and contract.</h2>
            <pre>{`curl https://api.tokenapi.biz/v1/tokens/base/0xabc... \
  -H "Authorization: Bearer tk_live_your_workspace_key"`}</pre>
            <div className="response-grid">
              <div>
                <h3>Example response</h3>
                <p>
                  Responses are normalized for UI rendering, search indexing, and agent context.
                </p>
              </div>
              <pre>{`{
  "chain": "base",
  "address": "0xabc...",
  "symbol": "TOKEN",
  "name": "Example Token",
  "decimals": 18,
  "market": {
    "priceUsd": "1.28",
    "liquidityUsd": "8400000",
    "volume24hUsd": "1150000"
  },
  "risk": {
    "status": "verified",
    "notes": ["contract verified"]
  }
}`}</pre>
            </div>
          </section>

          <section className="docs-card docs-two-column" id="limits">
            <div>
              <span className="docs-kicker">Rate limits</span>
              <h2>Rate limits scale by plan.</h2>
              <p>
                Starter keys are intended for prototypes. Developer and Enterprise keys
                unlock higher throughput, webhook delivery, and priority support.
              </p>
            </div>
            <ul className="docs-list">
              <li>Starter: 1,000 requests per month</li>
              <li>Developer: 250k requests per month</li>
              <li>Enterprise: custom quotas and SLA options</li>
            </ul>
          </section>

          <section className="docs-card" id="errors">
            <span className="docs-kicker">Error responses</span>
            <h2>Errors are predictable and machine-readable.</h2>
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
            <span className="docs-kicker">Launch status</span>
            <h2>The docs are ready for early access conversations.</h2>
            <p>
              This page defines the developer promise before the live backend is connected.
              The next production step is to connect an API-key request form, store leads,
              and wire the first real data provider.
            </p>
            <Link className="button button-primary" href="/#contact">
              Request API Access
            </Link>
          </section>
        </div>
      </div>
    </main>
  );
}
