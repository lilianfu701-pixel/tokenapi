import type { Metadata } from "next";
import { HOME } from "./_site/home-content";
import { HomePage } from "./_site/home-page";
import { alternates } from "./_site/i18n";

export const metadata: Metadata = { ...HOME.en.meta, alternates: alternates("en", "/") };

export default function Home() {
  return <HomePage locale="en" />;
}
