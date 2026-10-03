import { describe, expect, it } from "vitest";
import { LEGAL_TEXTS } from "@/app/_site/legal";
import { LEGAL, LEGAL_MISSING, legalValues } from "@/lib/legal";

function flatten(value: unknown, path = "", out: Record<string, string> = {}): Record<string, string> {
  if (typeof value === "string") out[path] = value;
  else if (Array.isArray(value)) value.forEach((v, i) => flatten(v, `${path}[${i}]`, out));
  else if (value && typeof value === "object") for (const [k, v] of Object.entries(value)) flatten(v, path ? `${path}.${k}` : k, out);
  return out;
}

const codeSpans = (s: string) => (s.match(/`[^`]+`/g) ?? []).sort();
const placeholders = (s: string) => (s.match(/\{[a-zA-Z]+\}/g) ?? []).sort();
const links = (s: string) => (s.match(/\]\((?:\/|#|https?:|mailto:)[^)]*\)/g) ?? []).sort();

const en = flatten(LEGAL_TEXTS.en);
const translations = Object.entries(LEGAL_TEXTS).filter(([l]) => l !== "en");

describe("legal texts", () => {
  it("English placeholders all resolve to a value", () => {
    const known = new Set(Object.keys({ ...legalValues(), enUrl: "" }).map((k) => `{${k}}`));
    const used = new Set(Object.values(en).flatMap(placeholders));
    expect([...used].filter((p) => !known.has(p))).toEqual([]);
  });

  it.each(translations)("%s has the same structure as English", (_locale, texts) => {
    expect(Object.keys(flatten(texts)).sort()).toEqual(Object.keys(en).sort());
  });

  it.each(translations)("%s keeps every code span, placeholder and link, and has no empty strings", (locale, texts) => {
    const t = flatten(texts);
    for (const [key, value] of Object.entries(en)) {
      expect.soft(t[key]?.trim(), `${locale} ${key} empty`).toBeTruthy();
      expect.soft(codeSpans(t[key] ?? ""), `${locale} ${key} code`).toEqual(codeSpans(value));
      expect.soft(placeholders(t[key] ?? ""), `${locale} ${key} placeholders`).toEqual(placeholders(value));
      expect.soft(links(t[key] ?? ""), `${locale} ${key} links`).toEqual(links(value));
    }
  });

  it("all 10 languages are translated", () => {
    expect(Object.keys(LEGAL_TEXTS).sort()).toEqual(["de", "en", "es", "fr", "ja", "ko", "pt", "ru", "zh", "zh-tw"].sort());
  });

  it("reports which company fields are still missing (pages stay hidden in production until empty)", () => {
    // Informational: lists what must be filled in lib/legal.ts before the legal pages go live.
    expect(Array.isArray(LEGAL_MISSING)).toBe(true);
    expect(LEGAL.balanceExpiryMonths).toBe(12);
  });
});
