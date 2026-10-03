import type { Metadata } from "next";
import { getDocs } from "../../_site/docs-content";
import { DocsPage } from "../../_site/docs-page";
import { alternates } from "../../_site/i18n";
import { type LangParams, localeStaticParams, resolveLocale } from "../locale-params";

export const dynamicParams = false;
export const generateStaticParams = localeStaticParams;

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  const locale = await resolveLocale(params);
  return { ...getDocs(locale).meta, alternates: alternates(locale, "/docs") };
}

export default async function LocalizedDocs({ params }: LangParams) {
  return <DocsPage locale={await resolveLocale(params)} />;
}
