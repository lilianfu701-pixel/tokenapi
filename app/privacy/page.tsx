import type { Metadata } from "next";
import { LegalDocPage, legalMetadata } from "../_site/legal/legal-page";

const LOCALE = "en" as const;

export const metadata: Metadata = legalMetadata(LOCALE, "privacy");

export default function Page() {
  return <LegalDocPage locale={LOCALE} docKey="privacy" />;
}
