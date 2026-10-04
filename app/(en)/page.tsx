import type { Metadata } from "next";
import { HomePage } from "@/app/_site/home-page";
import { alternates } from "@/app/_site/i18n";
import { getMessages } from "@/app/_site/locales";

export const metadata: Metadata = { ...getMessages("en").home.meta, alternates: alternates("en", "/") };

export default function Home() {
  return <HomePage locale="en" />;
}
