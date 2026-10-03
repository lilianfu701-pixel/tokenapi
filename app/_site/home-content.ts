import { API_BASE, CONTACT_EMAIL, type Locale } from "./i18n";

export interface HomeContent {
  meta: { title: string; description: string };
  eyebrow: string;
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

export const heroCode = `import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "${API_BASE}",
  apiKey: process.env.TOKENAPI_KEY,
});

const res = await client.chat.completions
  .create({
    model: "tokenapi-pro",
    messages: [
      { role: "user", content: "Hello!" },
    ],
  });`;

export const HOME: Record<Locale, HomeContent> = {
  en: {
    meta: {
      title: "TokenAPI | One API key for top AI models",
      description:
        "TokenAPI is an OpenAI-compatible AI model gateway: stable model IDs, automatic failover, streaming, and per-token billing. Works with the OpenAI and Anthropic SDKs.",
    },
    eyebrow: "Unified AI model API",
    title: "One API key. Top models. Zero rewrites.",
    lead:
      "TokenAPI is an OpenAI-compatible gateway. Call stable model IDs with the SDK you already use; we route every request to a strong backend, fail over automatically and bill you per token.",
    ctaPrimary: "Get an API key",
    ctaSecondary: "Browse models",
    stats: [
      { value: "1 key", label: "for every model we serve" },
      { value: "3 APIs", label: "Chat Completions · Responses · Messages" },
      { value: "Auto", label: "failover before the first token" },
      { value: "Per token", label: "pay only for what you use" },
    ],
    how: {
      eyebrow: "How it works",
      title: "Your code talks to one endpoint. We handle the rest.",
      body:
        "A model ID is a stable product, not a hard-wired vendor model. Behind it sits a primary route and ordered fallbacks. Upgrading or re-routing a model happens on our side; your requests stay exactly the same.",
      steps: [
        { title: "Your app", body: '`model: "tokenapi-pro"` to `/v1/chat/completions`' },
        { title: "TokenAPI gateway", body: "Authenticates the key, applies limits, reserves the maximum cost." },
        { title: "Routing", body: "Primary backend first; on failure, the next route takes over before any token is sent." },
        { title: "Response", body: "Streamed back in the format you called, then settled to the exact token usage." },
      ],
    },
    features: {
      eyebrow: "Why TokenAPI",
      title: "Built for teams shipping AI to production.",
      items: [
        { kicker: "Drop-in", title: "Works with the SDKs you already use", body: "Point the official OpenAI or Anthropic SDK at our base URL. No new client library, no code rewrite." },
        { kicker: "Stable IDs", title: "Model names that never break your code", body: "You call a stable model ID such as tokenapi-pro. We keep it served by a strong backend, so your integration never has to change." },
        { kicker: "Resilience", title: "Automatic failover", body: "If a backend is slow, rate-limited or down, the request is retried on the next route before you receive a single token." },
        { kicker: "Streaming", title: "Server-sent events everywhere", body: "Token-by-token streaming on all three API formats, including tool calls and usage reporting." },
        { kicker: "Billing", title: "Exact, per-request accounting", body: "Every request is metered in micro-dollars. A request reserves its maximum cost up front and settles to the real usage, so a balance is never overdrawn." },
        { kicker: "Controls", title: "Limits per API key", body: "Per-key rate limits, spend caps, expiry dates and model allow-lists keep each project and teammate in bounds." },
      ],
    },
    pricing: {
      eyebrow: "Pricing",
      title: "Pay as you go. No subscription.",
      payg: {
        tag: "Every model",
        name: "Per-token pricing",
        headline: "Prepaid",
        body: "Each model has its own input and output price per million tokens. Top up a balance and spend it on any model.",
        bullets: ["Prices listed per model", "Charged on actual tokens", "Unused reservations released instantly"],
        cta: "See model prices",
      },
      custom: {
        tag: "Teams & volume",
        name: "Custom",
        headline: "Talk to us",
        body: "Higher rate limits, invoicing and volume pricing for production workloads.",
        bullets: ["Custom rate limits", "Multiple keys with spend caps", "Priority support"],
        cta: "Contact sales",
        subject: "TokenAPI volume pricing",
      },
    },
    faq: {
      eyebrow: "FAQ",
      title: "Common questions.",
      items: [
        { q: "Which models can I use?", a: "The live list, with capabilities, context length and prices, is on the Models page. Each TokenAPI model is served by a leading upstream model provider; we may change the backend behind a model ID to keep quality and uptime high. Ask any model what it runs on and it will tell you." },
        { q: "Do I have to change my code?", a: "Only the base URL and the API key. Requests and responses follow the OpenAI Chat Completions and Responses formats and the Anthropic Messages format." },
        { q: "What happens when a provider has an outage?", a: "Models can have several backend routes. If the primary fails before it starts answering, the next route is tried automatically and you get a normal response." },
        { q: "How am I billed?", a: "Prepaid balance, per-token prices listed per model. Before a request runs we reserve its maximum possible cost, then charge the actual tokens and release the rest immediately." },
        { q: "Do you store my prompts?", a: "No. We log request metadata needed for billing and support (model, token counts, cost, latency, status), not prompt or completion content. Requests are processed by the upstream provider serving the model." },
        { q: "How do I get an API key?", a: `We are onboarding customers manually during early access. Email ${CONTACT_EMAIL} and we will set up your account, balance and keys.` },
      ],
    },
    contact: {
      eyebrow: "Get started",
      title: "Get your API key.",
      body: "Early access is open. Tell us what you are building and we will set up your account, balance and keys.",
      primary: "Request access",
      secondary: "Read the docs",
    },
  },

  zh: {
    meta: {
      title: "TokenAPI | 一个 API Key，调用主流大模型",
      description:
        "TokenAPI 是兼容 OpenAI 的大模型 API 网关：稳定的模型 ID、自动故障切换、流式输出、按 token 计费。直接使用 OpenAI / Anthropic 官方 SDK 接入。",
    },
    eyebrow: "统一大模型 API",
    title: "一个 Key\n接入主流大模型\n代码零改动",
    lead:
      "TokenAPI 是兼容 OpenAI 协议的大模型网关。用你现有的 SDK 调用稳定的模型 ID，我们把每个请求路由到优质的后端模型，故障时自动切换，按实际 token 计费。",
    ctaPrimary: "申请 API Key",
    ctaSecondary: "查看模型",
    stats: [
      { value: "1 个 Key", label: "调用平台全部模型" },
      { value: "3 种 API", label: "Chat Completions · Responses · Messages" },
      { value: "自动", label: "首个 token 前故障即切换" },
      { value: "按 token", label: "用多少付多少" },
    ],
    how: {
      eyebrow: "工作原理",
      title: "只对接一个地址，\n其余交给我们。",
      body:
        "模型 ID 是一个稳定的产品，而不是写死的某家厂商模型。每个模型背后都有主路由和按优先级排列的备用路由。模型升级或切换后端都在我们这边完成，你的请求无需任何改动。",
      steps: [
        { title: "你的应用", body: '向 `/v1/chat/completions` 发送 `model: "tokenapi-pro"`' },
        { title: "TokenAPI 网关", body: "校验 Key、执行限额，并预先冻结本次请求的最高费用。" },
        { title: "智能路由", body: "优先调用主路由；一旦失败，在返回任何 token 之前自动切换到下一条路由。" },
        { title: "返回结果", body: "按你调用的格式流式返回，结束后按实际 token 用量结算。" },
      ],
    },
    features: {
      eyebrow: "为什么选择 TokenAPI",
      title: "为生产级 AI 应用而建。",
      items: [
        { kicker: "即插即用", title: "直接用现有 SDK", body: "把 OpenAI 或 Anthropic 官方 SDK 的 base URL 指向我们即可，无需新的客户端库，也无需重写代码。" },
        { kicker: "稳定 ID", title: "模型名称永不失效", body: "你调用的是 tokenapi-pro 这样的稳定模型 ID，我们负责让它始终由优质后端提供服务，你的集成永远不用改。" },
        { kicker: "高可用", title: "自动故障切换", body: "后端响应慢、被限流或宕机时，请求会在你收到第一个 token 之前自动转到下一条路由。" },
        { kicker: "流式输出", title: "全面支持 SSE", body: "三种 API 格式都支持逐 token 流式返回，包括工具调用和用量统计。" },
        { kicker: "计费", title: "每次请求精确记账", body: "按微美元精确计量。请求前先冻结最高可能费用，结束后按实际用量结算，账户余额绝不会被透支。" },
        { kicker: "管控", title: "按 Key 设置限额", body: "每个 Key 可单独设置速率限制、消费上限、有效期和可用模型，项目和成员各自可控。" },
      ],
    },
    pricing: {
      eyebrow: "价格",
      title: "按量付费，无需订阅。",
      payg: {
        tag: "所有模型",
        name: "按 token 计费",
        headline: "预充值",
        body: "每个模型都有独立的每百万 token 输入、输出单价。充值一次余额，可用于任意模型。",
        bullets: ["每个模型单独标价", "按实际 token 扣费", "未用完的冻结额度即时返还"],
        cta: "查看模型价格",
      },
      custom: {
        tag: "团队与大客户",
        name: "定制方案",
        headline: "联系我们",
        body: "面向生产环境的更高速率限制、对公开票与用量折扣。",
        bullets: ["定制速率限制", "多个 Key 分别设消费上限", "优先技术支持"],
        cta: "联系商务",
        subject: "TokenAPI 大客户咨询",
      },
    },
    faq: {
      eyebrow: "常见问题",
      title: "常见问题",
      items: [
        { q: "可以使用哪些模型？", a: "模型页面实时列出所有模型及其能力、上下文长度和价格。每个 TokenAPI 模型都由业界领先的上游模型提供方提供服务；为保证质量和可用性，我们可能调整某个模型 ID 背后的后端。直接问模型它运行在什么底层模型上，它会如实回答。" },
        { q: "需要改代码吗？", a: "只需改 base URL 和 API Key。请求和响应遵循 OpenAI Chat Completions、Responses 格式以及 Anthropic Messages 格式。" },
        { q: "上游服务商故障怎么办？", a: "每个模型可以配置多条后端路由。主路由在开始返回内容之前失败时，会自动尝试下一条路由，你收到的是一次正常的响应。" },
        { q: "怎么计费？", a: "预充值余额，每个模型按 token 单独定价。请求开始前冻结其最高可能费用，结束后按实际 token 扣费，剩余部分立即返还。" },
        { q: "会保存我的提示词吗？", a: "不会。我们只记录计费和售后所需的请求元数据（模型、token 数、费用、耗时、状态），不保存提示词和回复内容。请求由提供该模型的上游服务商处理。" },
        { q: "如何获取 API Key？", a: `目前处于抢先体验阶段，由我们人工开通。请发邮件至 ${CONTACT_EMAIL}，我们会为你开通账户、充值并创建 Key。` },
      ],
    },
    contact: {
      eyebrow: "开始使用",
      title: "获取你的 API Key",
      body: "抢先体验已开放。告诉我们你在做什么，我们会为你开通账户、余额和 Key。",
      primary: "申请开通",
      secondary: "阅读文档",
    },
  },
};
