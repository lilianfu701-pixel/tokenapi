import { SiteDocument, baseMetadata } from "../_site/document";

export const metadata = baseMetadata;

/** Root layout for English pages (served at the root) and the admin panel. */
export default function EnglishRootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <SiteDocument lang="en">{children}</SiteDocument>;
}
