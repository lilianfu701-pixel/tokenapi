import Link from "next/link";
import { API_BASE, CONTACT_EMAIL, SiteFooter, SiteHeader } from "./_site/site-chrome";

const stats = [
  { value: "1 key", label: "for every model we serve" },
  { value: "3 APIs", label: "Chat Completions · Responses · Messages" },
  { value: "Auto", label: "failover before the first token" },
  { value: "Per token", label: "pay only for what you use" },
] as const;

const features = [
  {
    kicker: "Drop-in",
    title: "Works with the SDKs you already use",
    description: "Point the official OpenAI or Anthropic SDK at our base URL. No new client library, no code rewrite.",
  },
  {
    kicker: "Stable IDs",
    title: "Model names that never break your code",
    description: "You call a stable model ID such as premium-model. We keep it served by a strong backend, so your integration never has to change.",
  },
  {
    kicker: "Resilience",
    title: "Automatic failover",
    description: "If a backend is slow, rate-limited or down, the request is retried on the next route before you receive a single token.",
  },
  {
    kicker: "Streaming",
    title: "Server-sent events everywhere",
    description: "Token-by-token streaming on all three API formats, including tool calls and usage reporting.",
  },
  {
    kicker: "Billing",
    title: "Exact, per-request accounting",
    description: "Every request is metered in micro-dollars. A request reserves its maximum cost up front and settles to the real usage, so a balance is never overdrawn.",
  },
  {
    kicker: "Controls",
    title: "Limits per API key",
    description: "Per-key rate limits, spend caps, expiry dates and model allow-lists keep each project and teammate in bounds.",
  },
] as const;

const faqItems = [
  {
    question: "Which models can I use?",
    answer:
      "The live list, with capabilities, context length and prices, is on the Models page. Each TokenAPI model is served by a leading upstream model provider; we may change the backend behind a model ID to keep quality and uptime high. Ask any model what it runs on and it will tell you.",
  },
  {
    question: "Do I have to change my code?",
    answer:
      "Only the base URL and the API key. Requests and responses follow the OpenAI Chat Completions and Responses formats and the Anthropic Messages format.",
  },
  {
    question: "What happens when a provider has an outage?",
    answer:
      "Models can have several backend routes. If the primary fails before it starts answering, the next route is tried automatically and you get a normal response.",
  },
  {
    question: "How am I billed?",
    answer:
      "Prepaid balance, per-token prices listed per model. Before a request runs we reserve its maximum possible cost, then charge the actual tokens and release the rest immediately.",
  },
  {
    question: "Do you store my prompts?",
    answer:
      "No. We log request metadata needed for billing and support (model, token counts, cost, latency, status), not prompt or completion content. Requests are processed by the upstream provider serving the model.",
  },
  {
    question: "How do I get an API key?",
    answer: `We are onboarding customers manually during early access. Email ${CONTACT_EMAIL} and we will set up your account, balance and keys.`,
  },
] as const;

const heroCode = `import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "${API_BASE}",
  apiKey: process.env.TOKENAPI_KEY,
});

const res = await client.chat.completions
  .create({
    model: "premium-model",
    messages: [
      { role: "user", content: "Hello!" },
    ],
  });`;

export default function Home() {
  return (
    <main className="site-shell">
      <SiteHeader />

      <section className="hero" id="product">
        <div className="hero-copy">
          <span className="eyebrow">Unified AI model API</span>
          <h1>One API key. Top models. Zero rewrites.</h1>
          <p>
            TokenAPI is an OpenAI-compatible gateway. Call stable model IDs with the SDK you already use;
            we route every request to a strong backend, fail over automatically and bill you per token.
          </p>
          <div className="hero-actions">
            <a className="button button-primary" href={`mailto:${CONTACT_EMAIL}?subject=TokenAPI%20API%20key`}>Get an API key</a>
            <Link className="button button-secondary" href="/models">Browse models</Link>
          </div>
        </div>

        <aside className="api-console" aria-label="Example request">
          <div className="console-bar">
            <span>quickstart.ts</span>
            <span>OpenAI SDK</span>
          </div>
          <pre>{heroCode}</pre>
        </aside>
      </section>

      <section className="stats-band stats-band-4" aria-label="TokenAPI highlights">
        {stats.map((stat) => (
          <article key={stat.label}>
            <strong>{stat.value}</strong>
            <span>{stat.label}</span>
          </article>
        ))}
      </section>

      <section className="section split-section" id="how">
        <div className="section-intro">
          <span className="eyebrow">How it works</span>
          <h2>Your code talks to one endpoint. We handle the rest.</h2>
          <p>
            A model ID is a stable product, not a hard-wired vendor model. Behind it sits a primary route and
            ordered fallbacks. Upgrading or re-routing a model happens on our side; your requests stay exactly the same.
          </p>
        </div>

        <ol className="route-flow" aria-label="Request flow">
          <li>
            <span className="route-step">1</span>
            <div>
              <h3>Your app</h3>
              <p><code>model: &quot;premium-model&quot;</code> to <code>/v1/chat/completions</code></p>
            </div>
          </li>
          <li>
            <span className="route-step">2</span>
            <div>
              <h3>TokenAPI gateway</h3>
              <p>Authenticates the key, applies limits, reserves the maximum cost.</p>
            </div>
          </li>
          <li>
            <span className="route-step">3</span>
            <div>
              <h3>Routing</h3>
              <p>Primary backend first; on failure, the next route takes over before any token is sent.</p>
            </div>
          </li>
          <li>
            <span className="route-step">4</span>
            <div>
              <h3>Response</h3>
              <p>Streamed back in the format you called, then settled to the exact token usage.</p>
            </div>
          </li>
        </ol>
      </section>

      <section className="section" id="features">
        <div className="section-heading">
          <span className="eyebrow">Why TokenAPI</span>
          <h2>Built for teams shipping AI to production.</h2>
        </div>
        <div className="capability-grid feature-grid">
          {features.map((f) => (
            <article key={f.title} className="content-card">
              <span className="endpoint">{f.kicker}</span>
              <h3>{f.title}</h3>
              <p>{f.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section pricing-section" id="pricing">
        <div className="section-heading">
          <span className="eyebrow">Pricing</span>
          <h2>Pay as you go. No subscription.</h2>
        </div>
        <div className="pricing-grid pricing-grid-2">
          <article className="pricing-card">
            <div>
              <span>Every model</span>
              <h3>Per-token pricing</h3>
            </div>
            <strong>Prepaid</strong>
            <p>Each model has its own input and output price per million tokens. Top up a balance and spend it on any model.</p>
            <ul>
              <li>Prices listed per model</li>
              <li>Charged on actual tokens</li>
              <li>Unused reservations released instantly</li>
            </ul>
            <Link className="button button-primary" href="/models">See model prices</Link>
          </article>
          <article className="pricing-card">
            <div>
              <span>Teams & volume</span>
              <h3>Custom</h3>
            </div>
            <strong>Talk to us</strong>
            <p>Higher rate limits, invoicing and volume pricing for production workloads.</p>
            <ul>
              <li>Custom rate limits</li>
              <li>Multiple keys with spend caps</li>
              <li>Priority support</li>
            </ul>
            <a className="button button-secondary" href={`mailto:${CONTACT_EMAIL}?subject=TokenAPI%20volume%20pricing`}>Contact sales</a>
          </article>
        </div>
      </section>

      <section className="section faq-section" id="faq">
        <div className="section-heading">
          <span className="eyebrow">FAQ</span>
          <h2>Common questions.</h2>
        </div>
        <div className="faq-list">
          {faqItems.map((item) => (
            <article key={item.question} className="faq-item">
              <h3>{item.question}</h3>
              <p>{item.answer}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="contact-section" id="contact">
        <div className="access-copy">
          <span className="eyebrow">Get started</span>
          <h2>Get your API key.</h2>
          <p>Early access is open. Tell us what you are building and we will set up your account, balance and keys.</p>
        </div>
        <div className="hero-actions">
          <a className="button button-primary" href={`mailto:${CONTACT_EMAIL}?subject=TokenAPI%20API%20key`}>Request access</a>
          <Link className="button button-secondary" href="/docs">Read the docs</Link>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
