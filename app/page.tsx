const languageCards = [
  {
    code: "EN",
    label: "English",
    eyebrow: "Global launch copy",
    title: "Ship one idea, speak to the whole market.",
    description:
      "TokenAPI keeps the message aligned across launch pages, docs, and support content without making every market feel translated.",
    bullets: [
      "Write once in GitHub and reuse the same source of truth.",
      "Preview and publish through Vercel with a fast feedback loop.",
      "Keep product language, SEO, and CTA structure consistent.",
    ],
    tone: "cyan",
  },
  {
    code: "中文",
    label: "简体中文",
    eyebrow: "全球中文受众",
    title: "一次写清楚，多语言同步上线。",
    description:
      "把产品介绍、文档入口和转化路径统一到同一个内容系统里，让中文用户看到的是本地化表达，而不是直译。",
    bullets: [
      "适合 API、开发者工具和技术型品牌。",
      "GitHub 里维护内容，Vercel 上直接预览。",
      "术语、按钮和信息层级保持一致。",
    ],
    tone: "amber",
  },
  {
    code: "ES",
    label: "Español",
    eyebrow: "Audience expansion",
    title: "Una sola historia, lista para equipos globales.",
    description:
      "TokenAPI lets you present the same product with a voice that feels local in Spanish-speaking markets while staying consistent everywhere else.",
    bullets: [
      "Clear copy for buyers, partners, and engineers.",
      "One design system, one deploy path, many locales.",
      "Fast enough for launch campaigns and ongoing updates.",
    ],
    tone: "teal",
  },
] as const;

const metrics = [
  { value: "3", label: "languages on the page" },
  { value: "1", label: "source of truth in GitHub" },
  { value: "1", label: "deploy path on Vercel" },
] as const;

const workflow = [
  {
    step: "01",
    title: "Draft in GitHub",
    description:
      "Keep the copy, layout, and launch notes together so the whole team works from the same repository.",
  },
  {
    step: "02",
    title: "Preview on Vercel",
    description:
      "Every update gets a clean preview URL before the public site changes, which keeps the launch calm and predictable.",
  },
  {
    step: "03",
    title: "Publish globally",
    description:
      "When the page feels right, the same build can speak to English, Chinese, and Spanish audiences without a rewrite.",
  },
] as const;

const capabilities = [
  {
    title: "Content architecture",
    description:
      "One homepage structure, multiple language voices, and no duplicated layout decisions.",
  },
  {
    title: "API-first positioning",
    description:
      "The site feels right for token, API, and developer-tool brands that need a credible business presence.",
  },
  {
    title: "SEO-ready metadata",
    description:
      "Simple copy hierarchy, strong headings, and clean metadata for international discovery.",
  },
  {
    title: "Fast deployment",
    description:
      "GitHub keeps the edits organized and Vercel turns them into a public URL quickly.",
  },
] as const;

export default function Home() {
  return (
    <main className="site-shell">
      <div className="orb orb-a" aria-hidden="true" />
      <div className="orb orb-b" aria-hidden="true" />
      <div className="orb orb-c" aria-hidden="true" />

      <header className="topbar container">
        <a className="brand" href="#top" aria-label="TokenAPI home">
          <span className="brand-mark" aria-hidden="true">
            T
          </span>
          <span className="brand-copy">
            <strong>TokenAPI</strong>
            <span>Multilingual web presence</span>
          </span>
        </a>

        <nav className="topnav" aria-label="Sections">
          <a href="#languages">Languages</a>
          <a href="#workflow">GitHub + Vercel</a>
          <a href="#capabilities">Capabilities</a>
        </nav>
      </header>

      <section className="hero container" id="top">
        <div className="hero-copy">
          <span className="eyebrow">
            Built for global API brands and multilingual launches
          </span>
          <h1>One site, three languages, zero confusion.</h1>
          <p className="hero-lead">
            TokenAPI is a sharp, business-ready website for teams that want a
            strong English, Chinese, and Spanish presence without splitting the
            product story into three different experiences.
          </p>

          <div className="hero-actions">
            <a className="button button-primary" href="#languages">
              Explore the languages
            </a>
            <a className="button button-secondary" href="#workflow">
              See the GitHub + Vercel flow
            </a>
          </div>

          <div className="metric-row" aria-label="Project highlights">
            {metrics.map((metric) => (
              <article key={metric.label} className="metric-card">
                <strong>{metric.value}</strong>
                <span>{metric.label}</span>
              </article>
            ))}
          </div>
        </div>

        <aside className="hero-panel" aria-label="Launch summary">
          <div className="panel-head">
            <span className="panel-label">Launch summary</span>
            <span className="panel-pill">GitHub → Vercel</span>
          </div>

          <div className="panel-body">
            <p className="panel-title">
              Designed to feel native in every market.
            </p>
            <ul className="panel-list">
              <li>Localized copy for product buyers and developers</li>
              <li>Shared layout and CTA strategy across all languages</li>
              <li>Clean enough for docs, polished enough for a homepage</li>
            </ul>
          </div>

          <div className="panel-footer">
            <span className="mini-pill">English</span>
            <span className="mini-pill">简体中文</span>
            <span className="mini-pill">Español</span>
          </div>
        </aside>
      </section>

      <section className="section container" id="languages">
        <div className="section-heading">
          <span className="eyebrow">Three language voices</span>
          <h2>Keep the brand consistent while the wording adapts locally.</h2>
        </div>

        <div className="language-grid">
          {languageCards.map((card) => (
            <article key={card.label} className={`language-card tone-${card.tone}`}>
              <div className="card-topline">
                <span className="card-code">{card.code}</span>
                <span className="card-eyebrow">{card.eyebrow}</span>
              </div>
              <h3>{card.title}</h3>
              <p>{card.description}</p>
              <ul>
                {card.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="section container" id="workflow">
        <div className="section-heading narrow">
          <span className="eyebrow">Workflow</span>
          <h2>GitHub keeps the source tidy. Vercel turns it into a public site.</h2>
        </div>

        <div className="workflow-grid">
          {workflow.map((item) => (
            <article key={item.step} className="workflow-card">
              <span className="workflow-step">{item.step}</span>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section container" id="capabilities">
        <div className="section-heading">
          <span className="eyebrow">Why it works</span>
          <h2>A layout that gives broad reach without feeling generic.</h2>
        </div>

        <div className="capability-grid">
          {capabilities.map((item) => (
            <article key={item.title} className="capability-card">
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section container cta-shell" aria-label="Call to action">
        <div>
          <span className="eyebrow">Ready for the next step</span>
          <h2>We can wire in your real GitHub repo and Vercel project next.</h2>
        </div>
        <p>
          This first version gives TokenAPI a polished multilingual front page.
          Once your GitHub connection is refreshed, I can connect the codebase
          and move the same site into your deployment pipeline.
        </p>
      </section>

      <footer className="footer container">
        <span>TokenAPI.biz</span>
        <span>Built for international audiences</span>
        <span>GitHub + Vercel ready</span>
      </footer>
    </main>
  );
}
