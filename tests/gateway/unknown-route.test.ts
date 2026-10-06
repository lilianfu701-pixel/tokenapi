import { describe, expect, it } from "vitest";
import * as route from "@/app/v1/[...path]/route";

const call = (method: keyof typeof route, path: string) =>
  (route[method] as (req: Request) => Response)(new Request(`https://tokenapi.biz${path}`, { method }));

describe("unknown /v1 paths", () => {
  it.each(["GET", "POST", "PUT", "PATCH", "DELETE"] as const)("%s returns an OpenAI-style JSON 404", async (method) => {
    const res = call(method, "/v1/embeddings");
    expect(res.status).toBe(404);
    expect(res.headers.get("content-type")).toContain("application/json");
    const body = await res.json();
    expect(body.error.code).toBe("unknown_endpoint");
    expect(body.error.message).toContain("/v1/embeddings");
  });
});
