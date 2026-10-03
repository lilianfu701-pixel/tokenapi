import type { Metadata } from "next";
import { LegalDocPage, legalMetadata } from "../../_site/legal/legal-page";
import { type LangParams, localeStaticParams, resolveLocale } from "../locale-params";

export const dynamicParams = false;
export const generateStaticParams = localeStaticParams;

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  return legalMetadata(await resolveLocale(params), "terms");
}

export default async function Page({ params }: LangParams) {
  const locale = await resolveLocale(params);
  return <LegalDocPage locale={locale} docKey="terms" />;
}
