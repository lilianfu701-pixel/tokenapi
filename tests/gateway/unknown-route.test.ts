import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import { middleware } from "@/middleware";

describe("retired /v1 paths", () => {
  it.each(["GET", "POST", "PUT", "PATCH", "DELETE"] as const)("%s returns JSON 410", async (method) => {
    const res = middleware(new NextRequest("https://tokenapi.biz/v1/embeddings", { method }));
    expect(res.status).toBe(410);
    expect(res.headers.get("content-type")).toContain("application/json");
    const body = await res.json();
    expect(body.error.code).toBe("gone");
    expect(body.error.message).toContain("disabled");
  });
});
