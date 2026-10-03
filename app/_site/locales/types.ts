// Every string the public site renders, per locale. TypeScript enforces completeness:
// a locale file that misses a key does not compile.
//
// Inline markup inside strings: `code` and [label](/path or mailto:...) — see rich().
// Placeholders: {email}, {base}, {models}, {vendors}, {date}, {n}.

export interface ChromeText {
  tagline: string;
  navAria: string;
  nav: { models: string; docs: string; pricing: string; faq: string };
  cta: string;
  ctaSubject: string;
  langMenu: string;
  footerTag: string;
}

export interface HomeText {
  meta: { title: string; description: string };
  eyebrow: string;
  /** May contain "\n" for authored line breaks (used by CJK locales). */
  title: string;
  lead: string;
  ctaPrimary: string;
  ctaSecondary: string;
  stats: Array<{ value: string; label: string }>;
  how: { eyebrow: string; title: string; body: string; steps: Array<{ title: string; body: string }> };
  features: { eyebrow: string; title: string; items: Array<{ kicker: string; title: string; body: string }> };
  pricing: {
    eyebrow: string;
    title: string;
    payg: { tag: string; name: string; headline: string; body: string; bullets: string[]; cta: string };
    custom: { tag: string; name: string; headline: string; body: string; bullets: string[]; cta: string; subject: string };
  };
  faq: { eyebrow: string; title: string; items: Array<{ q: string; a: string }> };
  contact: { eyebrow: string; title: string; body: string; primary: string; secondary: string };
}

export interface ModelsText {
  meta: { title: string; description: string };
  subtitle: string;
  eyebrow: string;
  title: string;
  lead: string;
  ownTitle: string;
  ownBody: string;
  unavailable: string;
  jsonKicker: string;
  jsonTitle: string;
  jsonBody: string;
}

export interface TableText {
  list: string;
  model: string;
  capabilities: string;
  context: string;
  input: string;
  output: string;
  caps: { streaming: string; tools: string; vision: string; json_output: string; reasoning: string };
}

export interface CatalogText {
  title: string;
  source: string;
  nav: string;
  models: string;
  head: [string, string, string, string, string, string];
  caps: { reasoning: string; tools: string; vision: string; openWeights: string };
}

export interface DocsText {
  meta: { title: string; description: string };
  subtitle: string;
  eyebrow: string;
  title: string;
  lead: string;
  sidebarLabel: string;
  contactCta: string;
  /** [title, description] for GET /v1/models, GET /v1/models/{id}, POST chat, POST responses, POST messages. */
  endpoints: [[string, string], [string, string], [string, string], [string, string], [string, string]];
  /** Details for 400, 401, 402, 403, 404, 429, 502. */
  errors: [string, string, string, string, string, string, string];
  quickstart: { nav: string; kicker: string; title: string; allEndpoints: string };
  auth: { nav: string; kicker: string; title: string; body: string };
  models: { nav: string; kicker: string; title: string; body: string; pricingNote: string };
  chat: { nav: string; body: string; maxTokens: string };
  streaming: { nav: string; kicker: string; title: string; body: string };
  responses: { nav: string; body: string };
  messages: { nav: string; body: string };
  errorsSection: { nav: string; kicker: string; title: string; example: string; footer: string };
  billing: { nav: string; kicker: string; title: string; list: [string, string, string, string, string] };
  compat: { nav: string; kicker: string; title: string; list: [string, string, string] };
}

export interface Messages {
  chrome: ChromeText;
  home: HomeText;
  models: ModelsText;
  table: TableText;
  catalog: CatalogText;
  docs: DocsText;
}

/** "{n} models" + { n: 3 } -> "3 models" */
export function fmt(template: string, values: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (m, k: string) => (k in values ? String(values[k]) : m));
}
