import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { price } from "@/app/_site/model-table";
import { PUBLIC_MODELS } from "@/app/_site/public-models";

describe("static public models", () => {
  it("lists the seeded TokenAPI aliases with public prices", () => {
    expect(PUBLIC_MODELS.map((m) => m.id)).toEqual(["tokenapi-fast", "tokenapi-plus", "tokenapi-pro", "tokenapi-think"]);
    const fast = PUBLIC_MODELS[0];
    expect(fast.display_name).toBe("TokenAPI Fast");
    expect(fast.description).toContain("everyday tasks");
    expect(fast.capabilities[0]).toBe("streaming");
    expect(fast.capabilities).toContain("vision");
    expect(fast.context_length).toBe(1_000_000);
    expect(price(fast.pricing?.input_per_million)).toBe("$0.195");
    expect(price(fast.pricing?.output_per_million)).toBe("$0.611");

    const pro = PUBLIC_MODELS[2];
    expect(price(pro.pricing?.input_per_million)).toBe("$2.60");
    expect(price(pro.pricing?.output_per_million)).toBe("$7.80");

    const think = PUBLIC_MODELS[3];
    expect(think.capabilities).not.toContain("vision");
    expect(price(think.pricing?.input_per_million)).toBe("$0.858");
    expect(price(think.pricing?.output_per_million)).toBe("$2.574");

    for (const model of PUBLIC_MODELS) {
      const serialized = JSON.stringify(model).toLowerCase();
      expect(serialized).not.toContain("qwen");
      expect(serialized).not.toContain("deepseek");
      expect(serialized).not.toContain("alibaba");
    }
  });

  it("does not load models from the database at request time", () => {
    const page = readFileSync("app/_site/models-page.tsx", "utf8");
    expect(page).not.toContain("createNeonRepo");
    expect(page).not.toContain("force-dynamic");
    for (const file of ["app/(en)/models/page.tsx", "app/[lang]/models/page.tsx"]) {
      const src = readFileSync(file, "utf8");
      expect(src).not.toContain("force-dynamic");
      expect(src).toContain('dynamic = "force-static"');
    }
    expect(existsSync("app/v1/chat/completions/route.ts")).toBe(false);
    expect(existsSync("app/v1/models/route.ts")).toBe(false);
    expect(existsSync("app/v1/[...path]/route.ts")).toBe(false);
  });
});
