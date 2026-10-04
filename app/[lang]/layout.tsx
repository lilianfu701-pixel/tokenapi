import { SiteDocument, baseMetadata } from "../_site/document";
import { htmlLang } from "../_site/i18n";
import { type LangParams, localeStaticParams, resolveLocale } from "./locale-params";

export const metadata = baseMetadata;
// Only the known locale prefixes exist; anything else is a 404 (app/global-not-found.tsx).
export const dynamicParams = false;
export const generateStaticParams = localeStaticParams;

/** Root layout for prefixed locales (/zh, /ja, ...): sets <html lang> per locale. */
export default async function LocaleRootLayout({ children, params }: Readonly<LangParams & { children: React.ReactNode }>) {
  const locale = await resolveLocale(params);
  return <SiteDocument lang={htmlLang(locale)}>{children}</SiteDocument>;
}
