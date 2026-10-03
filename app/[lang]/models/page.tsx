import type { Metadata } from "next";
import { alternates } from "../../_site/i18n";
import { getMessages } from "../../_site/locales";
import { ModelsPage } from "../../_site/models-page";
import { type LangParams, localeStaticParams, resolveLocale } from "../locale-params";

export const dynamic = "force-dynamic";
export const dynamicParams = false;
export const generateStaticParams = localeStaticParams;

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  const locale = await resolveLocale(params);
  return { ...getMessages(locale).models.meta, alternates: alternates(locale, "/models") };
}

export default async function LocalizedModels({ params }: LangParams) {
  return <ModelsPage locale={await resolveLocale(params)} />;
}
