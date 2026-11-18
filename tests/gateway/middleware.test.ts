import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import { middleware } from "@/middleware";

const req = (path: string, headers: Record<string, string> = {}, method = "GET") =>
  new NextRequest(`https://tokenapi.biz${path}`, { headers, method });

const redirectTarget = (res: Response) => {
  const loc = res.headers.get("location");
  return loc ? new URL(loc).pathname + new URL(loc).search : null;
};

describe("homepage language detection", () => {
  it.each([
    ["zh-CN,zh;q=0.9,en;q=0.8", "/zh"],
    ["zh-TW,zh;q=0.9", "/zh-tw"],
    ["zh-HK", "/zh-tw"],
    ["ja-JP,ja;q=0.9", "/ja"],
    ["ko-KR", "/ko"],
    ["es-ES,es;q=0.9", "/es"],
    ["fr-CA,fr;q=0.9,en;q=0.5", "/fr"],
    ["de-DE", "/de"],
    ["pt-BR", "/pt"],
    ["ru", "/ru"],
  ])("Accept-Language %s -> %s", (accept, target) => {
    const res = middleware(req("/", { "accept-language": accept }));
    expect(res.status).toBe(307);
    expect(redirectTarget(res)).toBe(target);
    expect(res.headers.get("vary")).toContain("Accept-Language");
  });

  it.each([["en-US,en;q=0.9"], ["it-IT,nl;q=0.8"], [""]])("stays on English for %j", (accept) => {
    const res = middleware(req("/", accept ? { "accept-language": accept } : {}));
    expect(res.status).toBe(200);
    expect(res.headers.get("location")).toBeNull();
  });

  it("a remembered choice beats the browser language", () => {
    const stayEnglish = middleware(req("/", { "accept-language": "zh-CN", cookie: "tokenapi_lang=en" }));
    expect(stayEnglish.headers.get("location")).toBeNull();
    const toJa = middleware(req("/", { "accept-language": "en-US", cookie: "tokenapi_lang=ja" }));
    expect(redirectTarget(toJa)).toBe("/ja");
  });

  it("ignores an invalid cookie value and falls back to the browser language", () => {
    const res = middleware(req("/", { "accept-language": "ko", cookie: "tokenapi_lang=xx" }));
    expect(redirectTarget(res)).toBe("/ko");
  });

  it("never redirects deep links, even with a non-English browser", () => {
    for (const path of ["/models", "/docs", "/ja", "/zh/models"]) {
      const res = middleware(req(path, { "accept-language": "zh-CN" }));
      expect(res.headers.get("location"), path).toBeNull();
    }
  });
});

describe("explicit language choice (?lang=)", () => {
  it("stores the choice in a cookie and redirects to the clean URL", () => {
    const res = middleware(req("/?lang=en", { "accept-language": "zh-CN" }));
    expect(res.status).toBe(307);
    expect(redirectTarget(res)).toBe("/");
    expect(res.headers.get("set-cookie")).toMatch(/tokenapi_lang=en;.*Path=\//i);
  });

  it("works on any page and keeps other query params", () => {
    const res = middleware(req("/ja/models?lang=ja&x=1"));
    expect(redirectTarget(res)).toBe("/ja/models?x=1");
    expect(res.headers.get("set-cookie")).toContain("tokenapi_lang=ja");
  });

  it("drops an unsupported value without setting a cookie", () => {
    const res = middleware(req("/?lang=xx"));
    expect(redirectTarget(res)).toBe("/");
    expect(res.headers.get("set-cookie")).toBeNull();
  });
});

describe("retired backend routes answer on the edge", () => {
  it("gateway preflight is a cheap 410", () => {
    const res = middleware(req("/v1/chat/completions", {}, "OPTIONS"));
    expect(res.status).toBe(410);
    expect(res.headers.get("access-control-allow-headers")).toBe("*");
    expect(res.headers.get("access-control-allow-origin")).toBe("*");
    expect(res.headers.get("location")).toBeNull();
  });

  it("API calls are never language-redirected", () => {
    const res = middleware(req("/v1/models?lang=ja", { "accept-language": "ja" }));
    expect(res.status).toBe(410);
    expect(res.headers.get("location")).toBeNull();
    expect(res.headers.get("access-control-allow-origin")).toBe("*");
  });

  it.each(["/v1", "/v1/messages", "/api", "/api/sync", "/api/v1/models"])("%s is gone", (path) => {
    const res = middleware(req(path, { "accept-language": "zh-CN" }, "POST"));
    expect(res.status).toBe(410);
    expect(res.headers.get("location")).toBeNull();
  });

  it("server actions are rejected before a function can run", async () => {
    const res = middleware(req("/docs", { "next-action": "abc" }, "POST"));
    expect(res.status).toBe(410);
    expect((await res.json()).error.code).toBe("gone");
  });

  it("admin GET is the static login page; other methods are gone", () => {
    const login = middleware(req("/admin/login"));
    expect(login.status).toBe(200);
    expect(login.headers.get("location")).toBeNull();
    expect(login.headers.get("x-middleware-rewrite")).toBeNull();

    const panel = middleware(req("/admin/logs", { "accept-language": "ja" }));
    expect(panel.status).toBe(200);
    expect(panel.headers.get("location")).toBeNull();
    expect(panel.headers.get("x-middleware-rewrite")).toContain("/admin/login");

    const post = middleware(req("/admin/login", {}, "POST"));
    expect(post.status).toBe(410);
  });
});
