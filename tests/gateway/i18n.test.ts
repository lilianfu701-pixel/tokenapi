import { describe, expect, it } from "vitest";
import { getDocs } from "@/app/_site/docs-content";
import { MESSAGES } from "@/app/_site/locales";
import type { Messages } from "@/app/_site/locales/types";
import { LOCALES, type Locale, alternates, localeForTag, localePath, matchAcceptLanguage } from "@/lib/i18n/locales";

const codes = LOCALES.map((l) => l.code);
const others = codes.filter((c) => c !== "en");

describe("locale paths", () => {
  it("prefixes non-English routes and keeps anchors", () => {
    expect(localePath("en", "/models")).toBe("/models");
    expect(localePath("zh", "/")).toBe("/zh");
    expect(localePath("zh-tw", "/models")).toBe("/zh-tw/models");
    expect(localePath("ja", "/#pricing")).toBe("/ja#pricing");
  });

  it("emits hreflang alternates for every language", () => {
    const alt = alternates("de", "/docs");
    expect(alt.canonical).toBe("/de/docs");
    expect(alt.languages).toMatchObject({ en: "/docs", "zh-CN": "/zh/docs", "zh-TW": "/zh-tw/docs", ja: "/ja/docs", "x-default": "/docs" });
    expect(Object.keys(alt.languages)).toHaveLength(LOCALES.length + 1);
  });
});

describe("browser language matching", () => {
  it.each([
    ["zh-CN", "zh"], ["zh", "zh"], ["zh-SG", "zh"], ["zh-Hans-CN", "zh"],
    ["zh-TW", "zh-tw"], ["zh-HK", "zh-tw"], ["zh-MO", "zh-tw"], ["zh-Hant", "zh-tw"],
    ["ja-JP", "ja"], ["ko-KR", "ko"], ["es-MX", "es"], ["fr-CA", "fr"], ["de-AT", "de"], ["pt-BR", "pt"], ["ru-RU", "ru"],
    ["en-GB", "en"], ["it-IT", null], ["*", null],
  ])("%s -> %s", (tag, expected) => {
    expect(localeForTag(tag)).toBe(expected);
  });

  it("honours q-values and falls through unsupported languages", () => {
    expect(matchAcceptLanguage("it-IT,it;q=0.9,ja;q=0.8,en;q=0.7")).toBe("ja");
    expect(matchAcceptLanguage("en;q=0.5,zh-TW;q=0.9")).toBe("zh-tw");
    expect(matchAcceptLanguage("de;q=0,fr;q=0.3")).toBe("fr");
    expect(matchAcceptLanguage("nl,sv")).toBeNull();
    expect(matchAcceptLanguage("")).toBeNull();
    expect(matchAcceptLanguage(null)).toBeNull();
  });
});

// ---------------------------------------------------------------- translation integrity

function flatten(value: unknown, path = "", out: Record<string, string> = {}): Record<string, string> {
  if (typeof value === "string") out[path] = value;
  else if (Array.isArray(value)) value.forEach((v, i) => flatten(v, `${path}[${i}]`, out));
  else if (value && typeof value === "object") for (const [k, v] of Object.entries(value)) flatten(v, path ? `${path}.${k}` : k, out);
  return out;
}

const codeSpans = (s: string) => (s.match(/`[^`]+`/g) ?? []).sort();
const placeholders = (s: string) => (s.match(/\{(email|models|vendors|base|date|n)\}/g) ?? []).sort();
const links = (s: string) => (s.match(/\]\(([^)]+)\)/g) ?? []).sort();

describe("all locales are complete and structurally identical to English", () => {
  const en = flatten(MESSAGES.en);

  it.each(others)("%s has exactly the same keys (incl. array lengths)", (locale) => {
    expect(Object.keys(flatten(MESSAGES[locale as Locale])).sort()).toEqual(Object.keys(en).sort());
  });

  it.each(others)("%s has no empty strings", (locale) => {
    const empty = Object.entries(flatten(MESSAGES[locale as Locale])).filter(([, v]) => !v.trim());
    expect(empty).toEqual([]);
  });

  it.each(others)("%s keeps every `code` identifier, placeholder and link target", (locale) => {
    const t = flatten(MESSAGES[locale as Locale]);
    for (const [key, value] of Object.entries(en)) {
      expect.soft(codeSpans(t[key]), `${locale} ${key} code spans`).toEqual(codeSpans(value));
      expect.soft(placeholders(t[key]), `${locale} ${key} placeholders`).toEqual(placeholders(value));
      expect.soft(links(t[key]), `${locale} ${key} links`).toEqual(links(value));
    }
  });

  it.each(codes)("%s docs build to the same section structure", (locale) => {
    const shape = (l: Locale) => getDocs(l).sections.map((s) => [s.id, s.blocks.map((b) => Object.keys(b)[0]).join(",")]);
    expect(shape(locale as Locale)).toEqual(shape("en"));
  });

  it("translated strings actually differ from English (no untranslated copies of long text)", () => {
    for (const locale of others) {
      const t = flatten(MESSAGES[locale as Locale]);
      const copied = Object.keys(en).filter((k) => en[k].length > 60 && t[k] === en[k]);
      expect(copied, locale).toEqual([]);
    }
  });

  it("type-level completeness: every registered locale has messages", () => {
    const m: Record<Locale, Messages> = MESSAGES;
    expect(Object.keys(m).sort()).toEqual([...codes].sort());
  });
});
