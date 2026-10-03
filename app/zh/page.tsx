import type { Metadata } from "next";
import { HOME } from "../_site/home-content";
import { HomePage } from "../_site/home-page";
import { alternates } from "../_site/i18n";

export const metadata: Metadata = { ...HOME.zh.meta, alternates: alternates("zh", "/") };

export default function HomeZh() {
  return <HomePage locale="zh" />;
}
