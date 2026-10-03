import type { Metadata } from "next";
import { ContactPage, legalMetadata } from "../_site/legal/legal-page";

const LOCALE = "en" as const;

export const metadata: Metadata = legalMetadata(LOCALE, "contact");

export default function Page() {
  return <ContactPage locale={LOCALE} />;
}
