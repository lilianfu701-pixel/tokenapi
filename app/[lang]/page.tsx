import type { Metadata } from "next";
import { HomePage } from "../_site/home-page";
import { alternates } from "../_site/i18n";
import { getMessages } from "../_site/locales";
import { type LangParams, localeStaticParams, resolveLocale } from "./locale-params";

export const dynamicParams = false;
export const generateStaticParams = localeStaticParams;

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  const locale = await resolveLocale(params);
  return { ...getMessages(locale).home.meta, alternates: alternates(locale, "/") };
}

export default async function LocalizedHome({ params }: LangParams) {
  return <HomePage locale={await resolveLocale(params)} />;
}
