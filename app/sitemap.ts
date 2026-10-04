import type { MetadataRoute } from "next";
import { LOCALES, localePath } from "@/lib/i18n/locales";
import { LEGAL_PAGES, legalPagesPublished } from "./_site/legal";
import { SITE_URL } from "./_site/i18n";

const MAIN_PAGES = [
  { path: "/", priority: 1, changeFrequency: "weekly" },
  { path: "/models", priority: 0.9, changeFrequency: "weekly" },
  { path: "/docs", priority: 0.8, changeFrequency: "monthly" },
] as const;

/** Every public page in every language, each with hreflang alternates. */
export default function sitemap(): MetadataRoute.Sitemap {
  const legal = legalPagesPublished()
    ? LEGAL_PAGES.map((p) => ({ path: p.path, priority: 0.3, changeFrequency: "yearly" as const }))
    : [];
  const pages = [...MAIN_PAGES, ...legal];
  const url = (path: string) => `${SITE_URL}${path === "/" ? "" : path}`;

  return pages.flatMap((page) => {
    const languages: Record<string, string> = {};
    for (const l of LOCALES) languages[l.html] = url(localePath(l.code, page.path));
    languages["x-default"] = url(page.path);
    return LOCALES.map((l) => ({
      url: url(localePath(l.code, page.path)),
      changeFrequency: page.changeFrequency,
      priority: page.priority,
      alternates: { languages },
    }));
  });
}
