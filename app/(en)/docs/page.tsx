import type { Metadata } from "next";
import { getDocs } from "@/app/_site/docs-content";
import { DocsPage } from "@/app/_site/docs-page";
import { alternates } from "@/app/_site/i18n";

export const metadata: Metadata = { ...getDocs("en").meta, alternates: alternates("en", "/docs") };

export default function Page() {
  return <DocsPage locale="en" />;
}
