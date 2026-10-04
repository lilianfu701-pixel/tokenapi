import type { Metadata } from "next";
import { LegalDocPage, legalMetadata } from "@/app/_site/legal/legal-page";

const LOCALE = "en" as const;

export const metadata: Metadata = legalMetadata(LOCALE, "terms");

export default function Page() {
  return <LegalDocPage locale={LOCALE} docKey="terms" />;
}
