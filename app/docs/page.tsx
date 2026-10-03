import type { Metadata } from "next";
import { DOCS } from "../_site/docs-content";
import { DocsPage } from "../_site/docs-page";
import { alternates } from "../_site/i18n";

export const metadata: Metadata = { ...DOCS.en.meta, alternates: alternates("en", "/docs") };

export default function Page() {
  return <DocsPage locale="en" />;
}
