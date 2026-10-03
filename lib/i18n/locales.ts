// Locale registry + routing helpers. Pure TS (no React) so middleware can import it.

export const LOCALES = [
  { code: "en", html: "en", label: "English" },
  { code: "zh", html: "zh-CN", label: "简体中文" },
  { code: "zh-tw", html: "zh-TW", label: "繁體中文" },
  { code: "ja", html: "ja", label: "日本語" },
  { code: "ko", html: "ko", label: "한국어" },
  { code: "es", html: "es", label: "Español" },
  { code: "fr", html: "fr", label: "Français" },
  { code: "de", html: "de", label: "Deutsch" },
  { code: "pt", html: "pt", label: "Português" },
  { code: "ru", html: "ru", label: "Русский" },
] as const;

export type Locale = (typeof LOCALES)[number]["code"];

export const DEFAULT_LOCALE: Locale = "en";
export const LANG_COOKIE = "tokenapi_lang";

const CODES = new Set<string>(LOCALES.map((l) => l.code));

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && CODES.has(value);
}

/** Non-default locales get a URL prefix; English lives at the root. */
export const PREFIXED_LOCALES = LOCALES.filter((l) => l.code !== DEFAULT_LOCALE).map((l) => l.code);

export function htmlLang(locale: Locale) {
  return LOCALES.find((l) => l.code === locale)!.html;
}

/** "/models" -> "/ja/models"; "/#pricing" -> "/ja#pricing"; English unchanged. */
export function localePath(locale: Locale, path: string) {
  if (locale === DEFAULT_LOCALE) return path;
  if (path === "/") return `/${locale}`;
  if (path.startsWith("/#")) return `/${locale}${path.slice(1)}`;
  return `/${locale}${path}`;
}

/** hreflang alternates for a page path (without locale prefix). */
export function alternates(locale: Locale, path: string) {
  const languages: Record<string, string> = {};
  for (const l of LOCALES) languages[l.html] = localePath(l.code, path);
  languages["x-default"] = path;
  return { canonical: localePath(locale, path), languages };
}

/** Maps one BCP 47 tag (e.g. "zh-HK", "pt-BR", "en-GB") to a supported locale. */
export function localeForTag(tag: string): Locale | null {
  const t = tag.trim().toLowerCase();
  if (!t || t === "*") return null;
  const [lang, ...rest] = t.split("-");
  if (lang === "zh") {
    // Traditional: Taiwan, Hong Kong, Macau or an explicit Hant script subtag.
    if (rest.some((p) => p === "tw" || p === "hk" || p === "mo" || p === "hant")) return "zh-tw";
    return "zh";
  }
  return isLocale(lang) ? lang : null;
}

/**
 * Best supported locale for an Accept-Language header, honouring q-values
 * (ties keep header order). Null when nothing matches.
 */
export function matchAcceptLanguage(header: string | null | undefined): Locale | null {
  if (!header) return null;
  const ranked = header
    .split(",")
    .map((part, index) => {
      const [tag, ...params] = part.trim().split(";");
      const q = params.map((p) => p.trim()).find((p) => p.startsWith("q="));
      const quality = q ? Number(q.slice(2)) : 1;
      return { tag, quality: Number.isFinite(quality) ? quality : 0, index };
    })
    .filter((x) => x.tag && x.quality > 0)
    .sort((a, b) => b.quality - a.quality || a.index - b.index);
  for (const { tag } of ranked) {
    const locale = localeForTag(tag);
    if (locale) return locale;
  }
  return null;
}
