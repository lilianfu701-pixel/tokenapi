import { readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import { middleware } from "@/middleware";
import { SITE_PAGES, isKnownPath } from "@/lib/site-routes";

const req = (path: string) => new NextRequest(`https://tokenapi.biz${path}`, { headers: { "accept-language": "en" } });

/** Every page.tsx under app/, as a URL path without the locale segment or route groups. */
function pagePaths(dir = "app"): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) return pagePaths(full);
    if (name !== "page.tsx") return [];
    const segments = relative("app", dir).split(sep).filter((s) => s && !/^\(.*\)$/.test(s) && s !== "[lang]");
    return [`/${segments.join("/")}`];
  });
}

describe("known site routes", () => {
  it("lists every public page in app/ (admin is matched by prefix)", () => {
    const pages = [...new Set(pagePaths().filter((p) => !p.startsWith("/admin")))].sort();
    expect([...SITE_PAGES].sort()).toEqual(pages);
  });

  it.each(["/", "/models", "/zh", "/zh-tw/docs", "/pt/terms", "/admin", "/admin/logs", "/v1/models", "/sitemap.xml", "/robots.txt", "/favicon.svg", "/models/"])(
    "%s is known",
    (path) => expect(isKnownPath(path)).toBe(true),
  );

  it.each(["/nope", "/en", "/xx/models", "/zh/nope", "/api/v1/models", "/api/sync", "/models/extra", "/old/page.html", "/favicon.ico"])(
    "%s is unknown",
    (path) => expect(isKnownPath(path)).toBe(false),
  );
});

describe("unknown URLs go to the home page", () => {
  it.each(["/nope", "/api/v1/models?q=btc", "/zh/nope", "/old/page.html"])("%s -> 301 /", (path) => {
    const res = middleware(req(path));
    expect(res.status).toBe(301);
    expect(new URL(res.headers.get("location")!).pathname).toBe("/");
  });

  it("known pages are not redirected", () => {
    expect(middleware(req("/models")).headers.get("location")).toBeNull();
    expect(middleware(req("/robots.txt")).headers.get("location")).toBeNull();
  });

  it("unknown gateway paths are left to the JSON 404 route", () => {
    const res = middleware(req("/v1/embeddings"));
    expect(res.headers.get("location")).toBeNull();
  });
});
