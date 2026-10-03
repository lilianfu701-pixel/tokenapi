import type { Metadata } from "next";
import { HomePage } from "./_site/home-page";
import { alternates } from "./_site/i18n";
import { getMessages } from "./_site/locales";

export const metadata: Metadata = { ...getMessages("en").home.meta, alternates: alternates("en", "/") };

export default function Home() {
  return <HomePage locale="en" />;
}
