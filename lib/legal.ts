// Single source of truth for the legal entity shown in Terms, Privacy, Refund and Contact.
// Only `company` is required; jurisdiction and address are optional and shown on the
// Contact page when filled in. Legal pages stay unpublished in production until LEGAL_READY.

export const LEGAL = {
  /** Operator name shown in the legal texts */
  company: "TokenAPI",
  /** Optional: country / state of registration, e.g. "Delaware, United States" */
  jurisdiction: "",
  /** Optional: registered business address (one line) */
  address: "",
  /** Date the current versions take effect (YYYY-MM-DD) */
  effective: "2026-10-03",
  emails: {
    general: "hello@tokenapi.biz",
    support: "hello@tokenapi.biz",
    privacy: "hello@tokenapi.biz",
    abuse: "hello@tokenapi.biz",
    legal: "hello@tokenapi.biz",
  },
  /** Business days within which we reply */
  responseDays: 2,
  /** Months without usage or top-up after which a balance expires */
  balanceExpiryMonths: 12,
  /** Days of notice before a balance expires */
  expiryNoticeDays: 30,
  /** Days to report a billing error */
  billingDisputeDays: 30,
} as const;

const REQUIRED = ["company"] as const;

export const LEGAL_MISSING = REQUIRED.filter((k) => !LEGAL[k].trim());
export const LEGAL_READY = LEGAL_MISSING.length === 0;

/** Values substituted into {placeholders} in legal texts. */
export function legalValues(): Record<string, string | number> {
  const show = (v: string, label: string) => v.trim() || `[${label}]`;
  return {
    company: show(LEGAL.company, "COMPANY NAME"),
    jurisdiction: LEGAL.jurisdiction.trim(),
    address: LEGAL.address.trim(),
    date: LEGAL.effective,
    email: LEGAL.emails.general,
    supportEmail: LEGAL.emails.support,
    privacyEmail: LEGAL.emails.privacy,
    abuseEmail: LEGAL.emails.abuse,
    legalEmail: LEGAL.emails.legal,
    days: LEGAL.responseDays,
    expiryMonths: LEGAL.balanceExpiryMonths,
    noticeDays: LEGAL.expiryNoticeDays,
    disputeDays: LEGAL.billingDisputeDays,
  };
}
