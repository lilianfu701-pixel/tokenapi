const navItems = [
  { label: "Product", href: "#product" },
  { label: "API", href: "#api" },
  { label: "Use cases", href: "#use-cases" },
  { label: "Docs", href: "/docs" },
  { label: "Languages", href: "#languages" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
] as const;

const stats = [
  { value: "24/7", label: "market-ready token data" },
  { value: "3", label: "launch languages" },
  { value: "<120ms", label: "target edge response" },
] as const;

const capabilities = [
  {
    title: "Token profiles",
    description:
      "Resolve symbols, contracts, chains, logos, decimals, socials, and risk notes from one normalized endpoint.",
    endpoint: "GET /v1/tokens/{chain}/{address}",
  },
  {
    title: "Live market snapshots",
    description:
      "Surface price, liquidity, volume, market cap, and 24-hour movement for token pages and dashboards.",
    endpoint: "GET /v1/markets/snapshot",
  },
  {
    title: "Holder and transfer signals",
    description:
      "Track ownership concentration, recent transfer velocity, and wallet-level movement without building indexers.",
    endpoint: "GET /v1/signals/holders",
  },
  {
    title: "Webhook alerts",
    description:
      "Push token events into trading tools, compliance workflows, AI agents, and internal operations channels.",
    endpoint: "POST /v1/webhooks",
  },
] as const;

const useCases = [
  {
    title: "Wallets and portfolio apps",
    description:
      "Show users richer token pages with verified metadata, price movement, liquidity context, and risk labels.",
  },
  {
    title: "Exchanges and launchpads",
    description:
      "Screen new listings, monitor market activity, and keep token pages consistent across regions.",
  },
  {
    title: "AI agents",
    description:
      "Give agents structured token context they can cite when answering portfolio, research, or market questions.",
  },
  {
    title: "Analytics dashboards",
    description:
      "Build token monitors, sector boards, and compliance views without maintaining your own ingestion pipeline.",
  },
] as const;

const languagePanels = [
  {
    label: "English",
    title: "Token data infrastructure for products that need trusted market context.",
    body: "Position TokenAPI for developers, founders, and product teams that need clean crypto market data without building data plumbing first.",
  },
  {
    label: "简体中文",
    title: "为钱包、交易工具和 Web3 产品提供可信的 Token 数据 API。",
    body: "中文内容面向开发者、项目方和增长团队，清楚说明接口能力、接入方式、价格和常见问题。",
  },
  {
    label: "Español",
    title: "Datos de tokens listos para productos cripto globales.",
    body: "La versión en español ayuda a llegar a equipos, comunidades y clientes de mercados hispanohablantes con un mensaje local.",
  },
] as const;

const pricingTiers = [
  {
    name: "Starter",
    audience: "Indie builders",
    price: "$0",
    detail: "Prototype token search, metadata pages, and dashboards.",
    features: ["1,000 requests / month", "Community chains", "Email support"],
  },
  {
    name: "Developer",
    audience: "Production apps",
    price: "$49",
    detail: "For teams shipping wallets, trackers, and internal tools.",
    features: ["250k requests / month", "Webhook alerts", "Priority support"],
  },
  {
    name: "Enterprise",
    audience: "High-volume platforms",
    price: "Custom",
    detail: "Dedicated quotas, compliance workflows, and private chain coverage.",
    features: ["Custom limits", "SLA options", "Private onboarding"],
  },
] as const;

const integrationSteps = [
  "Create an API key",
  "Choose chains and endpoints",
  "Test requests in preview",
  "Deploy through GitHub and Vercel",
] as const;

const faqItems = [
  {
    question: "TokenAPI 现在是真实 API 吗？",
    answer:
      "当前网站先作为产品官网和需求收集入口上线。下一步可以接入真实数据源、API key、文档页和等待名单表单。",
  },
  {
    question: "支持哪些链？",
    answer:
      "网站文案预留了 Ethereum、Solana、Base、BNB Chain 等常见链的表达空间，真实接口上线前可以按你的数据源调整。",
  },
  {
    question: "Can this become a real developer portal?",
    answer:
      "Yes. The current structure is ready for docs, authentication, API reference pages, and live examples once we add the backend.",
  },
] as const;

export default function Home() {
  return (
    <main className="site-shell">
      <header className="topbar">
        <a className="brand" href="#product" aria-label="TokenAPI home">
          <span className="brand-mark" aria-hidden="true">
            T
          </span>
          <span>
            <strong>TokenAPI</strong>
            <small>Global token data</small>
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
          <span className="eyebrow">Token data API for global products</span>
          <h1>Build crypto products with cleaner token context.</h1>
          <p>
            TokenAPI gives wallets, exchanges, AI agents, and analytics teams a
            structured way to read token profiles, market snapshots, holder
            signals, and webhook alerts from one developer-friendly surface.
          </p>
          <div className="hero-actions">
            <a className="button button-primary" href="#contact">
              Request API Access
            </a>
            <a className="button button-secondary" href="/docs">
              Read developer docs
            </a>
          </div>
        </div>

        <aside className="api-console" aria-label="Example API response">
          <div className="console-bar">
            <span>tokenapi.biz</span>
            <span>200 OK</span>
          </div>
          <pre>{`curl https://api.tokenapi.biz/v1/tokens/base/0x...

{
  "symbol": "TOKEN",
  "chain": "Base",
  "priceUsd": "1.28",
  "liquidity": "8.4M",
  "risk": "verified"
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
          <span className="eyebrow">API capabilities</span>
          <h2>Everything a product needs before it can trust a token.</h2>
          <p>
            Start with normalized token data, then add market context, holder
            signals, and event-driven workflows as your product grows.
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
          <h2>Useful for teams that need token data inside real workflows.</h2>
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

      <section className="section language-section" id="languages">
        <div className="section-heading">
          <span className="eyebrow">Multilingual reach</span>
          <h2>One product story, written for three audiences from day one.</h2>
        </div>

        <div className="language-grid">
          {languagePanels.map((panel) => (
            <article key={panel.label} className="language-panel">
              <span>{panel.label}</span>
              <h3>{panel.title}</h3>
              <p>{panel.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section pricing-section" id="pricing">
        <div className="section-heading">
          <span className="eyebrow">Pricing</span>
          <h2>Simple tiers for prototypes, production apps, and platforms.</h2>
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

      <section className="section integration-section">
        <div className="integration-panel">
          <div>
            <span className="eyebrow">Integration path</span>
            <h2>From first API key to production deployment.</h2>
          </div>
          <ol>
            {integrationSteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
          <p>
            The website is maintained in GitHub and deployed through Vercel, so
            every content update can be reviewed before it reaches production.
          </p>
        </div>
      </section>

      <section className="section faq-section" id="faq">
        <div className="section-heading">
          <span className="eyebrow">常见问题</span>
          <h2>Clear answers before the API backend goes live.</h2>
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

      <section className="contact-section access-section" id="contact">
        <div className="access-copy">
          <span className="eyebrow">Lista de espera</span>
          <h2>Request API Access</h2>
          <p>
            Tell us what you want to build with TokenAPI. For now this static
            form opens your email client; the next step can connect it to a real
            database or CRM.
          </p>
        </div>

        <form
          className="access-form"
          action="/api/access-requests"
          method="post"
        >
          <label>
            Name
            <input name="name" type="text" placeholder="Your name" required />
          </label>
          <label>
            Email
            <input name="email" type="email" placeholder="you@example.com" required />
          </label>
          <label>
            Company or project
            <input name="company" type="text" placeholder="Wallet, exchange, app, or fund" />
          </label>
          <label>
            Use case
            <textarea
              name="use_case"
              placeholder="Tell us which token data workflow you need first."
              rows={4}
              required
            />
          </label>
          <button className="button button-primary" type="submit">
            Send access request
          </button>
          <p className="form-note">
            Requests are stored securely in the TokenAPI access queue. Prefer direct email? Write to{" "}
            <a href="mailto:hello@tokenapi.biz">hello@tokenapi.biz</a>.
          </p>
        </form>
      </section>

      <footer className="footer">
        <span>TokenAPI.biz</span>
        <span>Built with GitHub and Vercel</span>
        <span>English · 简体中文 · Español</span>
      </footer>
    </main>
  );
}
