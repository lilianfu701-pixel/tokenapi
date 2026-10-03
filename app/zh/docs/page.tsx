import type { Metadata } from "next";
import { DOCS } from "../../_site/docs-content";
import { DocsPage } from "../../_site/docs-page";
import { alternates } from "../../_site/i18n";

export const metadata: Metadata = { ...DOCS.zh.meta, alternates: alternates("zh", "/docs") };

export default function Page() {
  return <DocsPage locale="zh" />;
}
