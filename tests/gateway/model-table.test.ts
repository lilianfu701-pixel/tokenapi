import { describe, expect, it } from "vitest";
import { price } from "@/app/_site/model-table";

describe("public price display", () => {
  it("never rounds: shows exactly what is billed", () => {
    expect(price(1.625)).toBe("$1.625");
    expect(price(13)).toBe("$13.00");
    expect(price(0.065)).toBe("$0.065");
    expect(price(0.52)).toBe("$0.52");
    expect(price(0.000123)).toBe("$0.000123");
    expect(price(undefined)).toBe("—");
  });
});
