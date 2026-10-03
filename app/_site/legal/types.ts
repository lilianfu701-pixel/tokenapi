// Legal page content per locale. English is authoritative; translations must keep the same
// structure (same sections, same number of paragraphs/bullets) — enforced by tests.
//
// Inline markup: `code`, [label](/path | mailto:...). Placeholders come from lib/legal.ts:
// {company} {date} {email} {supportEmail}
// {privacyEmail} {abuseEmail} {legalEmail} {days} {expiryMonths} {noticeDays} {disputeDays}

export interface LegalSection {
  h: string;
  p?: string[];
  list?: string[];
}

export interface LegalDoc {
  title: string;
  description: string;
  intro: string;
  sections: LegalSection[];
}

export interface ContactDoc {
  title: string;
  description: string;
  intro: string;
  companyHeading: string;
  labels: { company: string; jurisdiction: string; address: string };
  channelsHeading: string;
  channels: Array<{ label: string; detail: string; emailKey: "general" | "support" | "privacy" | "abuse" | "legal" }>;
  responseNote: string;
}

export interface LegalChrome {
  /** Footer group label */
  footerLabel: string;
  nav: { terms: string; privacy: string; acceptableUse: string; refund: string; contact: string };
  effective: string;
  contents: string;
  /** Shown on translated pages; must link to the English page with [..]({enUrl}). */
  translationNotice: string;
}

export interface LegalTexts {
  chrome: LegalChrome;
  terms: LegalDoc;
  privacy: LegalDoc;
  acceptableUse: LegalDoc;
  refund: LegalDoc;
  contact: ContactDoc;
}

export type LegalDocKey = "terms" | "privacy" | "acceptableUse" | "refund";
