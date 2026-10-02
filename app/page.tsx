const navItems = [
  { label: "API", href: "#api" },
  { label: "Use cases", href: "#use-cases" },
  { label: "Docs", href: "/docs" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
] as const;

const stats = [
  { value: "4,900+", label: "AI models indexed" },
  { value: "60+", label: "providers tracked" },
  { value: "Daily", label: "price sync from models.dev" },
] as const;

const capabilities = [
  {
    title: "Model catalog",
    description:
      "Browse every commercial and open-weight AI model with pricing, context limits, capabilities, and modality support from one normalized endpoint.",
    endpoint: "GET /api/v1/models",
  },
  {
    title: "Provider directory",
    description:
      "List all AI providers with their model counts, SDK packages, API endpoints, and documentation links.",
    endpoint: "GET /api/v1/providers",
  },
  {
    title: "Side-by-side compare",
    description:
      "Compare 2–10 models across price, context window, capabilities, and features in a single request.",
    endpoint: "GET /api/v1/compare",
  },
  {
    title: "Smart search",
    description:
      "Search models by name, provider, family, or capability flags like reasoning, tool calling, and multimodal support.",
    endpoint: "GET /api/v1/search",
  },
] as const;

const useCases = [
  {
    title: "AI cost dashboards",
    description:
      "Build internal tools that track token costs across providers so engineering teams can optimize spend.",
  },
  {
    title: "Model routers",
    description:
      "Power intelligent routing logic that picks the cheapest model meeting capability requirements at runtime.",
  },
  {
    title: "Developer tools",
    description:
      "Give developers structured model metadata for IDE extensions, CLI tools, and platform configuration UIs.",
  },
  {
    title: "AI agents",
    description:
      "Let agents query model pricing and capabilities to make autonomous decisions about which model to call.",
  },
] as const;

const pricingTiers = [
  {
    name: "Open",
    audience: "Builders",
    price: "Free",
    detail: "Full catalog access with no API key required during beta.",
    features: ["All endpoints", "CORS enabled", "Community support"],
  },
  {
    name: "Developer",
    audience: "Production apps",
    price: "$9/mo",
    detail: "Higher rate limits and priority data freshness for production use.",
    features: ["10,000 req/day", "Price history API", "Email support"],
  },
  {
    name: "Enterprise",
    audience: "Platforms",
    price: "Custom",
    detail: "Dedicated quotas, SLA guarantees, and custom data feeds.",
    features: ["Unlimited requests", "Custom integrations", "Dedicated support"],
  },
] as const;

const faqItems = [
  {
    question: "Where does the data come from?",
    answer:
      "We sync daily from models.dev (MIT licensed, 7k+ GitHub stars) covering 4,900+ models from 60+ providers. Chinese model data is supplemented manually in Phase 2.",
  },
  {
    question: "Is an API key required?",
    answer:
      "Not during beta. All /api/v1/* endpoints are open with CORS enabled. API key authentication will be added in Phase 2 for rate limiting and usage tracking.",
  },
  {
    question: "How fresh is the pricing data?",
    answer:
      "The sync job runs daily via Vercel Cron. Pricing reflects the latest snapshot from models.dev, which tracks provider pricing pages in near real-time.",
  },
  {
    question: "Can I use this commercially?",
    answer:
      "Yes. The upstream data source (models.dev) is MIT licensed. TokenAPI adds its own API layer, filtering, and normalization on top.",
  },
] as const;

export default function Home() {
  return (
    <main className="site-shell">
      <header className="topbar">
        <a className="brand" href="#api" aria-label="TokenAPI home">
          <span className="brand-mark" aria-hidden="true">
            T
          </span>
          <span>
            <strong>TokenAPI</strong>
            <small>AI model pricing API</small>
          </span>
        </a>

        <nav className="topnav" aria-label="Primary navigation">
          {navItems.map((item) => (
            <a key={item.href} href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>
      </header>

      <section className="hero" id="product">
        <div className="hero-copy">
          <span className="eyebrow">AI Model Pricing API</span>
          <h1>Every AI model price in one API.</h1>
          <p>
            TokenAPI indexes 4,900+ AI models from 60+ providers. Query pricing,
            context limits, capabilities, and compare models with a single REST
            call. Built for cost dashboards, model routers, and developer tools.
          </p>
          <div className="hero-actions">
            <a className="button button-primary" href="/docs">
              Read the docs
            </a>
            <a className="button button-secondary" href="#api">
              See endpoints
            </a>
          </div>
        </div>

        <aside className="api-console" aria-label="Example API response">
          <div className="console-bar">
            <span>tokenapi.biz/api/v1</span>
            <span>200 OK</span>
          </div>
          <pre>{`curl https://tokenapi.biz/api/v1/models/anthropic/claude-sonnet-5-5

{
  "success": true,
  "data": {
    "id": "claude-sonnet-5-5",
    "provider_id": "anthropic",
    "name": "Claude Sonnet 5.5",
    "reasoning": true,
    "tool_call": true,
    "context_limit": 1000000,
    "cost_input": 3.00,
    "cost_output": 15.00
  }
}`}</pre>
        </aside>
      </section>

      <section className="stats-band" aria-label="TokenAPI highlights">
        {stats.map((stat) => (
          <article key={stat.label}>
            <strong>{stat.value}</strong>
            <span>{stat.label}</span>
          </article>
        ))}
      </section>

      <section className="section split-section" id="api">
        <div className="section-intro">
          <span className="eyebrow">API endpoints</span>
          <h2>Everything you need to compare AI model costs.</h2>
          <p>
            Start with the full catalog, filter by capability, compare prices
            side by side, or search by name. All responses follow a consistent
            JSON envelope with pagination.
          </p>
        </div>

        <div className="capability-grid">
          {capabilities.map((capability) => (
            <article key={capability.title} className="content-card">
              <span className="endpoint">{capability.endpoint}</span>
              <h3>{capability.title}</h3>
              <p>{capability.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section" id="use-cases">
        <div className="section-heading">
          <span className="eyebrow">Use cases</span>
          <h2>Built for teams that need AI pricing data in production.</h2>
        </div>

        <div className="use-case-grid">
          {useCases.map((item) => (
            <article key={item.title} className="content-card">
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section pricing-section" id="pricing">
        <div className="section-heading">
          <span className="eyebrow">Pricing</span>
          <h2>Free during beta. Simple tiers for production.</h2>
        </div>

        <div className="pricing-grid">
          {pricingTiers.map((tier) => (
            <article key={tier.name} className="pricing-card">
              <div>
                <span>{tier.audience}</span>
                <h3>{tier.name}</h3>
              </div>
              <strong>{tier.price}</strong>
              <p>{tier.detail}</p>
              <ul>
                {tier.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="section faq-section" id="faq">
        <div className="section-heading">
          <span className="eyebrow">FAQ</span>
          <h2>Common questions about the API.</h2>
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
          <h2>Start using the API today.</h2>
          <p>
            The API is free during beta with no key required. Have questions or
            want to discuss enterprise access? Reach out by email.
          </p>
        </div>
        <div className="hero-actions">
          <a className="button button-primary" href="/docs">
            Read the docs
          </a>
          <a className="button button-secondary" href="mailto:hello@tokenapi.biz">
            Contact us
          </a>
        </div>
      </section>

      <footer className="footer">
        <span>TokenAPI.biz</span>
        <span>Data from models.dev (MIT)</span>
        <span>Built with Next.js + Vercel</span>
      </footer>
    </main>
  );
}
