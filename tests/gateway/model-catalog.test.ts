import { describe, expect, it } from "vitest";
import catalog from "@/app/_site/model-catalog.json";

describe("public model catalog snapshot", () => {
  it("covers the mainstream first-party vendors", () => {
    const ids = catalog.vendors.map((v) => v.id);
    for (const v of ["openai", "anthropic", "google", "deepseek", "alibaba", "moonshotai", "zhipuai"]) expect(ids).toContain(v);
  });

  it("every entry has official prices and no duplicate names within a vendor", () => {
    for (const v of catalog.vendors) {
      const names = v.models.map((m) => m.name);
      expect(new Set(names).size).toBe(names.length);
      for (const m of v.models) {
        expect(typeof m.input).toBe("number");
        expect(typeof m.output).toBe("number");
      }
    }
  });

  it("vendors only list their own models (no re-hosted third-party models)", () => {
    const own: Record<string, RegExp> = { alibaba: /qwen|qwq|qvq/i, volcengine: /seed|doubao/i, mistral: /mistral|magistral|codestral|devstral|ministral|pixtral/i };
    for (const v of catalog.vendors) {
      const re = own[v.id];
      if (re) for (const m of v.models) expect(`${m.id} ${m.name}`).toMatch(re);
    }
  });

  it("contains only chat models (no embedding / speech / image generation)", () => {
    for (const v of catalog.vendors) for (const m of v.models) expect(`${m.id} ${m.name}`).not.toMatch(/embed|tts|whisper|asr|lyria|veo|imagen/i);
  });
});
