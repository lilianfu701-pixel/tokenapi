import { describe, expect, it } from "vitest";
import { DOCS } from "@/app/_site/docs-content";
import { HOME } from "@/app/_site/home-content";
import { alternates, localePath } from "@/app/_site/i18n";

describe("locale paths", () => {
  it("prefixes zh routes and keeps anchors", () => {
    expect(localePath("en", "/models")).toBe("/models");
    expect(localePath("zh", "/")).toBe("/zh");
    expect(localePath("zh", "/models")).toBe("/zh/models");
    expect(localePath("zh", "/#pricing")).toBe("/zh#pricing");
  });
  it("emits hreflang alternates for both languages", () => {
    expect(alternates("zh", "/docs")).toEqual({
      canonical: "/zh/docs",
      languages: { en: "/docs", "zh-CN": "/zh/docs", "x-default": "/docs" },
    });
  });
});

describe("translations stay in sync", () => {
  it("home: same number of stats, steps, features and FAQs", () => {
    for (const k of ["stats"] as const) expect(HOME.zh[k].length).toBe(HOME.en[k].length);
    expect(HOME.zh.how.steps.length).toBe(HOME.en.how.steps.length);
    expect(HOME.zh.features.items.length).toBe(HOME.en.features.items.length);
    expect(HOME.zh.faq.items.length).toBe(HOME.en.faq.items.length);
  });
  it("docs: same sections (ids + block shapes), endpoints and error codes", () => {
    const shape = (l: "en" | "zh") => DOCS[l].sections.map((s) => [s.id, s.blocks.map((b) => Object.keys(b)[0]).join(",")]);
    expect(shape("zh")).toEqual(shape("en"));
    expect(DOCS.zh.errors.map((e) => e.code)).toEqual(DOCS.en.errors.map((e) => e.code));
    expect(DOCS.zh.endpoints.map((e) => e.path)).toEqual(DOCS.en.endpoints.map((e) => e.path));
  });
});
