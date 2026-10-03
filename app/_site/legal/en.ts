import type { LegalTexts } from "./types";

export const en: LegalTexts = {
  chrome: {
    footerLabel: "Legal",
    nav: { terms: "Terms of Service", privacy: "Privacy Policy", acceptableUse: "Acceptable Use", refund: "Refunds & Balance", contact: "Contact" },
    effective: "Effective {date}",
    contents: "Contents",
    translationNotice: "This translation is provided for convenience. If it differs from the [English version]({enUrl}), the English version prevails.",
  },

  terms: {
    title: "Terms of Service",
    description: "The terms that govern your use of the TokenAPI AI model gateway, API keys, prepaid balance and billing.",
    intro: "These Terms of Service (\"Terms\") govern your access to and use of the TokenAPI website, API and related services (the \"Service\"), operated by {company} (\"TokenAPI\", \"we\", \"us\"). By creating an account, using an API key or otherwise using the Service, you agree to these Terms.",
    sections: [
      {
        h: "1. Who may use the Service",
        p: [
          "You must be at least 18 years old and able to enter into a binding contract. If you use the Service on behalf of a company or other organization, you confirm that you are authorized to accept these Terms for it, and \"you\" includes that organization.",
          "You may not use the Service if you are subject to sanctions, or located in a country or region where providing the Service is prohibited by applicable law. You are responsible for complying with export-control and sanctions laws that apply to your use.",
        ],
      },
      {
        h: "2. The Service",
        p: [
          "TokenAPI is an API gateway that gives you access to AI models through stable model IDs (for example `tokenapi-pro`). Each model ID is served by one or more third-party model providers. To maintain quality and availability we may change the provider or underlying model behind a model ID, route requests to fallback providers, and add, change or retire model IDs.",
          "AI models generate output automatically. Output may be inaccurate, incomplete, offensive or similar to output generated for others, and it does not reflect our views. You are responsible for evaluating output before relying on it.",
        ],
      },
      {
        h: "3. Accounts and API keys",
        p: [
          "You are responsible for keeping your account credentials and API keys confidential, and for all activity that occurs under them. Do not embed API keys in browser or mobile applications or share them with others. Notify us immediately at {supportEmail} if you believe a key has been compromised; we may revoke or rotate keys to protect you or the Service.",
          "You must provide accurate account information and keep it up to date.",
        ],
      },
      {
        h: "4. Prepaid balance, pricing and billing",
        p: [
          "The Service is paid for in advance. You add funds to a prepaid balance in US dollars, and usage is charged against that balance at the prices listed for each model on our [Models](/models) page at the time of the request. We may change prices for future usage; changes do not affect requests already completed.",
          "Before a request is processed we reserve its maximum possible cost from your balance, and after it completes we charge the actual usage and release the rest. Requests that fail before the model starts responding are not charged. If a streamed response is cancelled or interrupted, only the tokens already generated are charged. Usage is measured by our systems, and our records are the basis for charges, subject to the billing-error process in our [Refund & Balance Policy](/refund).",
          "Payments are non-refundable and balances expire after {expiryMonths} months without usage or top-ups, as described in the [Refund & Balance Policy](/refund). Prices exclude taxes; you are responsible for any taxes that apply to your purchases, other than taxes on our income.",
        ],
      },
      {
        h: "5. Acceptable use",
        p: [
          "You must comply with our [Acceptable Use Policy](/acceptable-use) and with the usage policies of the upstream model providers that serve your requests. We may block requests, limit rates or suspend access to prevent abuse or protect the Service.",
        ],
      },
      {
        h: "6. Your content",
        p: [
          "As between you and us, you retain your rights in the inputs you submit, and, to the extent permitted by law and the terms of the applicable model provider, you own the output generated for you. You are responsible for your inputs and for your use of output, including making sure you have the rights and consents needed to submit any data.",
          "You grant us the rights needed to transmit your inputs to model providers and return output to you, solely to provide the Service. We do not store the content of prompts or responses; we keep request metadata as described in our [Privacy Policy](/privacy). Model providers process requests under their own terms.",
        ],
      },
      {
        h: "7. Third-party providers",
        p: [
          "The Service depends on third-party model providers and infrastructure. Their terms and policies may apply to requests routed to them. We are not responsible for their services, outages or acts, but we work to route around failures where possible.",
        ],
      },
      {
        h: "8. Availability and changes",
        p: [
          "We aim to keep the Service available but do not guarantee uninterrupted or error-free operation unless we have agreed a service level with you in writing. We may perform maintenance, and may modify, suspend or discontinue features or model IDs. Where reasonably possible we will give advance notice of material changes.",
        ],
      },
      {
        h: "9. Suspension and termination",
        p: [
          "You may stop using the Service at any time. We may suspend or terminate your access, revoke API keys or refuse requests if you breach these Terms, create risk or legal exposure for us or others, fail to pay, initiate an unjustified chargeback, or if required by law. Where possible we will notify you first.",
          "If we terminate your account for convenience and not because of your breach, we will refund your unused balance. Otherwise, termination does not entitle you to a refund except where required by law.",
        ],
      },
      {
        h: "10. Disclaimers",
        p: [
          "To the maximum extent permitted by law, the Service and all output are provided \"as is\" and \"as available\", without warranties of any kind, including warranties of merchantability, fitness for a particular purpose, accuracy and non-infringement. Output is not professional, legal, medical or financial advice.",
        ],
      },
      {
        h: "11. Limitation of liability",
        p: [
          "To the maximum extent permitted by law, we will not be liable for any indirect, incidental, special, consequential or punitive damages, or for loss of profits, revenue, data or goodwill. Our total liability for all claims relating to the Service is limited to the greater of the amounts you paid us in the 12 months before the claim arose and USD 100.",
          "Nothing in these Terms limits liability that cannot be limited by law.",
        ],
      },
      {
        h: "12. Indemnity",
        p: [
          "You will defend and indemnify {company} against claims, damages and costs (including reasonable legal fees) arising from your inputs, your use of output, your breach of these Terms or the Acceptable Use Policy, or your violation of law or third-party rights.",
        ],
      },
      {
        h: "13. Changes to these Terms",
        p: [
          "We may update these Terms. We will post the new version with its effective date and, for material changes, notify you by email or in the Service. Continued use after the effective date means you accept the updated Terms.",
        ],
      },
      {
        h: "14. Governing law and disputes",
        p: [
          "These Terms are governed by the laws of the place where the operator of the Service is established, without regard to conflict-of-law rules. Before bringing any claim, please contact us at [{legalEmail}](mailto:{legalEmail}) so that we can try to resolve the dispute informally within 30 days. Nothing in this section limits mandatory consumer protection rights you have under the laws of your country of residence.",
        ],
      },
      {
        h: "15. Language and contact",
        p: [
          "These Terms may be translated for convenience; if a translation differs from the English version, the English version prevails. Questions about these Terms: [{legalEmail}](mailto:{legalEmail}).",
        ],
      },
    ],
  },

  privacy: {
    title: "Privacy Policy",
    description: "What personal data TokenAPI collects, how it is used and shared, where it is processed, and your rights.",
    intro: "This Privacy Policy explains how {company} (\"TokenAPI\", \"we\") collects, uses and shares personal data when you use our website and API (the \"Service\"). We are the controller of the personal data described here.",
    sections: [
      {
        h: "1. Data we collect",
        list: [
          "Account data: your email address, name, company name and the information you send us when you request access or contact us.",
          "Billing data: top-up amounts, balances, invoices and transaction records. Card and bank details are handled by our payment processors; we do not receive full card numbers.",
          "Usage metadata for each API request: request ID, timestamps, API key ID, the model ID called and the model that served it, token counts, cost, latency, status and error type, IP address and user agent.",
          "Website analytics: aggregated page-view statistics collected without advertising cookies (Vercel Web Analytics and Cloudflare Web Analytics).",
        ],
      },
      {
        h: "2. Prompt and response content",
        p: [
          "We do not store the content of your prompts or of model responses. Content is transmitted through our gateway to the model provider that serves the request and returned to you. Model providers process that content under their own terms and privacy policies, which may include temporary retention for abuse monitoring.",
        ],
      },
      {
        h: "3. How we use data",
        list: [
          "To provide the Service: authenticate API keys, route requests, enforce rate limits and spending caps.",
          "To bill you: reserve and settle charges, maintain balances, keep accounting records.",
          "To keep the Service secure: detect fraud, abuse and violations of our Acceptable Use Policy.",
          "To support you and communicate about your account, changes to the Service and these policies.",
          "To understand and improve the Service using aggregated statistics.",
          "To comply with legal obligations.",
        ],
      },
      {
        h: "4. Legal bases",
        p: [
          "Where the GDPR or similar laws apply, we process personal data to perform our contract with you, for our legitimate interests in operating, securing and improving the Service, to comply with legal obligations, and with your consent where consent is required.",
        ],
      },
      {
        h: "5. Who we share data with",
        p: [
          "We do not sell personal data. We share it only with service providers that help us run the Service, under contracts that restrict their use of it:",
        ],
        list: [
          "AI model providers that process your requests, including Alibaba Cloud, DeepSeek and Google.",
          "Hosting and infrastructure: Vercel (application hosting), Neon (database), Cloudflare (DNS and website analytics).",
          "Payment processors that handle your payments.",
          "Professional advisers and authorities where required by law or to protect our rights.",
        ],
      },
      {
        h: "6. International transfers",
        p: [
          "Our providers process data in several countries, including the United States, China and Singapore, which may not offer the same level of protection as your country. Where required, we rely on appropriate safeguards such as standard contractual clauses. Request content is processed in the country of the model provider that serves the request.",
        ],
      },
      {
        h: "7. Retention",
        p: [
          "We keep account data while your account is active and for a reasonable period afterwards. Usage and billing records are kept for as long as needed for accounting, tax, dispute and audit purposes, generally up to seven years. Aggregated statistics that do not identify you may be kept longer.",
        ],
      },
      {
        h: "8. Cookies",
        p: [
          "We use a small number of strictly necessary cookies: `tokenapi_lang` remembers the language you chose, and the admin area uses a session cookie for staff sign-in. Our website analytics do not use cookies. We do not use advertising or cross-site tracking cookies.",
        ],
      },
      {
        h: "9. Security",
        p: [
          "We protect data with encryption in transit, hashed API keys, encrypted upstream credentials, access controls and logging. No system is perfectly secure; please keep your API keys safe and report suspected incidents to [{supportEmail}](mailto:{supportEmail}).",
        ],
      },
      {
        h: "10. Your rights",
        p: [
          "Depending on where you live, you may have the right to access, correct, delete or export your personal data, to object to or restrict certain processing, and to withdraw consent. To exercise these rights, email [{privacyEmail}](mailto:{privacyEmail}). You may also complain to your data protection authority.",
        ],
      },
      {
        h: "11. Children",
        p: [
          "The Service is not directed to anyone under 18, and we do not knowingly collect their personal data.",
        ],
      },
      {
        h: "12. Changes and contact",
        p: [
          "We may update this policy and will post the new version with its effective date. Contact: {company}, [{privacyEmail}](mailto:{privacyEmail}).",
        ],
      },
    ],
  },

  acceptableUse: {
    title: "Acceptable Use Policy",
    description: "What you may not do with TokenAPI, and how we enforce it.",
    intro: "This policy applies to everyone who uses TokenAPI. It is part of our [Terms of Service](/terms). Requests are also subject to the usage policies of the model provider that serves them; where those are stricter, they apply too.",
    sections: [
      {
        h: "1. Prohibited content and activities",
        p: ["You may not use the Service, or help anyone else use it, to:"],
        list: [
          "break the law, or facilitate illegal activity;",
          "create, distribute or solicit sexual content involving minors, or any content that exploits or endangers children;",
          "promote or support terrorism or violent extremism, or incite violence;",
          "harass, threaten, bully or promote hatred against people based on protected characteristics;",
          "develop or use malware, intrude into systems, or attack the security or availability of any network or service;",
          "commit fraud, phishing, scams or spam, or impersonate people or organizations to deceive others;",
          "develop or acquire biological, chemical, nuclear or radiological weapons, or other weapons capable of mass casualties;",
          "run deceptive influence or disinformation campaigns, including about elections;",
          "infringe intellectual-property or privacy rights, or collect or process personal or sensitive data without a lawful basis;",
          "make fully automated decisions with legal or similarly significant effects on people (for example credit, employment, housing, medical or legal decisions) without appropriate human review.",
        ],
      },
      {
        h: "2. Misuse of the Service",
        p: ["You may not:"],
        list: [
          "bypass, disable or interfere with rate limits, spending caps, authentication or safety measures, or use multiple accounts to evade limits;",
          "share, sell or publish API keys, or resell access to the Service as a standalone API without our written agreement;",
          "use output to develop models that compete with the model providers where their terms prohibit it;",
          "probe, scan or load-test the Service without our permission, or interfere with other customers' use.",
        ],
      },
      {
        h: "3. Enforcement",
        p: [
          "We may investigate suspected violations and may block requests, revoke API keys, or suspend or terminate accounts, with or without notice depending on severity. Where required, we report illegal content to the authorities. Balances of accounts terminated for violations are not refunded.",
        ],
      },
      {
        h: "4. Reporting abuse",
        p: [
          "To report abuse or a vulnerability, email [{abuseEmail}](mailto:{abuseEmail}). Include request IDs (`x-request-id`) where you have them.",
        ],
      },
    ],
  },

  refund: {
    title: "Refund & Balance Policy",
    description: "How TokenAPI prepaid balances, charges, refunds, billing errors and balance expiry work.",
    intro: "TokenAPI is paid for with a prepaid balance. This policy explains how charges work, when money can be returned, and when a balance expires. It is part of our [Terms of Service](/terms).",
    sections: [
      {
        h: "1. Prepaid balance",
        p: [
          "You add funds in US dollars. Your balance is used only for TokenAPI usage at the per-model prices on our [Models](/models) page. A balance is not a bank deposit, does not earn interest and cannot be transferred to another account or exchanged for cash.",
        ],
      },
      {
        h: "2. How charges work",
        list: [
          "Before a request runs, its maximum possible cost (prompt plus `max_tokens`) is reserved from your balance. If your balance cannot cover it, the request is refused and nothing is charged.",
          "When the request finishes you are charged for the actual tokens, and the rest of the reservation is released immediately.",
          "Requests that fail before the model starts responding are not charged.",
          "If a streamed response is cancelled or interrupted, only the tokens already generated are charged.",
        ],
      },
      {
        h: "3. Refunds",
        p: [
          "Payments and top-ups are final and non-refundable, except where a refund is required by applicable law (for example, mandatory consumer-protection rights) or where we terminate your account for convenience and not because of your breach, in which case we refund your unused balance.",
        ],
      },
      {
        h: "4. Billing errors",
        p: [
          "If you believe you were charged incorrectly, contact [{supportEmail}](mailto:{supportEmail}) within {disputeDays} days of the charge with the relevant request IDs (`x-request-id`). If we confirm an error, we will credit the amount to your balance or, for a payment error, refund it to the original payment method.",
        ],
      },
      {
        h: "5. Balance expiry",
        p: [
          "A balance expires if your account has no API usage and no top-ups for {expiryMonths} consecutive months. We will email you at least {noticeDays} days before expiry; any usage or top-up before the expiry date keeps the balance active.",
        ],
      },
      {
        h: "6. Chargebacks",
        p: [
          "Please contact us before disputing a payment with your bank. If a chargeback is filed, we may suspend the account while it is reviewed. Unjustified chargebacks may lead to termination.",
        ],
      },
      {
        h: "7. Closing your account",
        p: [
          "You can ask us to close your account at any time. Any remaining balance is forfeited at closure, except where a refund is required by law or under section 3.",
        ],
      },
    ],
  },

  contact: {
    title: "Contact",
    description: "How to reach TokenAPI: company information, support, privacy, abuse and legal contacts.",
    intro: "We reply within {days} business days. For questions about a specific request, include its request ID from the `x-request-id` response header.",
    companyHeading: "Company",
    labels: { company: "Operated by", jurisdiction: "Registered in", address: "Address" },
    channelsHeading: "Get in touch",
    channels: [
      { label: "General & sales", detail: "API keys, volume pricing, partnerships.", emailKey: "general" },
      { label: "Support & billing", detail: "Technical issues, charges and balances.", emailKey: "support" },
      { label: "Privacy", detail: "Data access, correction and deletion requests.", emailKey: "privacy" },
      { label: "Abuse & security", detail: "Report misuse or a vulnerability.", emailKey: "abuse" },
      { label: "Legal", detail: "Notices and questions about our terms.", emailKey: "legal" },
    ],
    responseNote: "Formal legal notices should be sent by email to the legal address above.",
  },
};
