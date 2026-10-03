import { describe, expect, it } from "vitest";
import { checkBrandUsage } from "@/lib/gateway/brand-guard";
import { decryptSecret, encryptSecret, generateApiKey, hashApiKey } from "@/lib/gateway/crypto";
import { isRetryableStatus } from "@/lib/gateway/errors";
import { anthropicRequestToChat, chatToAnthropicRequest } from "@/lib/gateway/formats/anthropic";
import { responsesRequestToChat } from "@/lib/gateway/formats/responses";
import { customerChargeMicrousd, estimateTokens, publicPrices, upstreamCostMicrousd, usdToMicrousd } from "@/lib/gateway/pricing";
import { parseSse } from "@/lib/gateway/sse";
import { alias, model } from "./helpers";

describe("pricing", () => {
  const m = model("qwen", "qwen-max", { input_price: 2, output_price: 6, cache_read_price: 0.5 });
  const usage = { prompt_tokens: 1_000_000, completion_tokens: 500_000, total_tokens: 1_500_000, cached_tokens: 200_000 };

  it("bills cached prompt tokens at the cache price", () => {
    // 800k*2 + 200k*0.5 + 500k*6 = 1.6 + 0.1 + 3.0 = $4.7
    expect(upstreamCostMicrousd(m, usage)).toBe(4_700_000);
  });
  it("applies the alias multiplier", () => {
    expect(customerChargeMicrousd(alias({ price_multiplier: 2 }), m, usage)).toBe(9_400_000);
  });
  it("fixed public prices override the multiplier (stable price across re-routing)", () => {
    const a = alias({ public_input_price: 1, public_output_price: 4, price_multiplier: 10 });
    expect(customerChargeMicrousd(a, m, usage)).toBe(3_000_000);
    expect(publicPrices(a, m)).toEqual({ input: 1, output: 4 });
  });
  it("parses USD strings to integer microusd without float error", () => {
    expect(usdToMicrousd("0.1")).toBe(100_000);
    expect(usdToMicrousd("19.99")).toBe(19_990_000);
    expect(usdToMicrousd("-2.000001")).toBe(-2_000_001);
    expect(() => usdToMicrousd("1.0000001")).toThrow();
    expect(() => usdToMicrousd("abc")).toThrow();
  });
  it("estimates CJK at ~1 token/char", () => {
    expect(estimateTokens("你好世界")).toBe(4);
    expect(estimateTokens("abcdefgh")).toBe(2);
  });
});

describe("brand guard", () => {
  it("rejects another vendor's model brand on a differently-backed alias", () => {
    expect(checkBrandUsage(["premium-model", "Opus 5.5 Test"], "alibaba")).toMatch(/anthropic/);
    expect(checkBrandUsage(["gpt-fast", "Fast"], "deepseek")).toMatch(/openai/);
  });
  it("allows neutral names and the backing vendor's own brand", () => {
    for (const name of ["Fast", "Plus", "Pro", "Premium", "TokenAPI Fast", "TokenAPI Pro"]) {
      expect(checkBrandUsage(["premium-model", name], "alibaba")).toBeNull();
    }
    expect(checkBrandUsage(["qwen-max-proxy", "Qwen Max"], "alibaba")).toBeNull();
    expect(checkBrandUsage(["sonnet-direct", "Claude Sonnet"], "anthropic")).toBeNull();
  });
  it("does not trip on substrings inside other words", () => {
    expect(checkBrandUsage(["egpt", "Haikuesque writer"], "other")).toBeNull();
  });
});

describe("crypto", () => {
  const key = "a".repeat(64);
  it("round-trips encrypted upstream keys", () => {
    const enc = encryptSecret("sk-upstream-123", key);
    expect(enc).not.toContain("sk-upstream");
    expect(decryptSecret(enc, key)).toBe("sk-upstream-123");
  });
  it("rejects tampered ciphertext", () => {
    const [iv, tag, ct] = encryptSecret("secret", key).split(".");
    const flipped = Buffer.from(ct, "base64");
    flipped[0] ^= 1;
    expect(() => decryptSecret([iv, tag, flipped.toString("base64")].join("."), key)).toThrow();
  });
  it("generates prefixed keys whose hash matches", () => {
    const k = generateApiKey();
    expect(k.key.startsWith("sk-tk-")).toBe(true);
    expect(hashApiKey(k.key)).toBe(k.hash);
    expect(k.key.startsWith(k.prefix)).toBe(true);
  });
});

describe("retry policy", () => {
  it("only caller-fault statuses stop fallback", () => {
    expect([400, 413, 422].map(isRetryableStatus)).toEqual([false, false, false]);
    expect([401, 403, 404, 408, 429, 500, 503, 529].every(isRetryableStatus)).toBe(true);
  });
});

describe("SSE parser", () => {
  it("handles events split across network chunks and CRLF", async () => {
    const parts = ["event: a\r\ndata: {\"x\"", ":1}\r\n\r\nda", "ta: [DONE]\n\n"];
    const body = new ReadableStream<Uint8Array>({
      start(c) {
        parts.forEach((p) => c.enqueue(new TextEncoder().encode(p)));
        c.close();
      },
    });
    const out = [];
    for await (const e of parseSse(body)) out.push(e);
    expect(out).toEqual([{ event: "a", data: "{\"x\":1}" }, { event: undefined, data: "[DONE]" }]);
  });
});

describe("format translation", () => {
  it("chat -> anthropic: system hoisted, tool round-trip preserved, consecutive user turns merged", () => {
    const body = chatToAnthropicRequest({
      model: "claude-x",
      messages: [
        { role: "system", content: "S1" },
        { role: "user", content: [{ type: "text", text: "look" }, { type: "image_url", image_url: { url: "data:image/png;base64,AAAA" } }] },
        { role: "assistant", content: null, tool_calls: [{ id: "t1", type: "function", function: { name: "get", arguments: "{\"q\":1}" } }] },
        { role: "tool", tool_call_id: "t1", content: "result" },
        { role: "user", content: "thanks" },
      ],
      tools: [{ type: "function", function: { name: "get", parameters: { type: "object" } } }],
      tool_choice: "required",
      stop: "END",
    });
    expect(body.system).toBe("S1");
    const msgs = body.messages as Array<{ role: string; content: Array<Record<string, unknown>> }>;
    expect(msgs.map((m) => m.role)).toEqual(["user", "assistant", "user"]);
    expect(msgs[0].content[1]).toEqual({ type: "image", source: { type: "base64", media_type: "image/png", data: "AAAA" } });
    expect(msgs[1].content[0]).toEqual({ type: "tool_use", id: "t1", name: "get", input: { q: 1 } });
    expect(msgs[2].content.map((b) => b.type)).toEqual(["tool_result", "text"]);
    expect(body.tool_choice).toEqual({ type: "any" });
    expect(body.stop_sequences).toEqual(["END"]);
  });

  it("anthropic inbound -> chat: tool_result becomes a tool message before the user text", () => {
    const chat = anthropicRequestToChat({
      model: "m",
      max_tokens: 5,
      system: [{ type: "text", text: "sys" }],
      messages: [
        { role: "user", content: "q" },
        { role: "assistant", content: [{ type: "tool_use", id: "t1", name: "f", input: { a: 1 } }] },
        { role: "user", content: [{ type: "tool_result", tool_use_id: "t1", content: "42" }, { type: "text", text: "and?" }] },
      ],
      tools: [{ name: "f", input_schema: { type: "object" } }],
      tool_choice: { type: "tool", name: "f" },
    });
    expect(chat.messages.map((m) => m.role)).toEqual(["system", "user", "assistant", "tool", "user"]);
    expect(chat.messages[2].tool_calls?.[0].function).toEqual({ name: "f", arguments: "{\"a\":1}" });
    expect(chat.tool_choice).toEqual({ type: "function", function: { name: "f" } });
  });

  it("responses inbound -> chat: function_call items and outputs map to tool calls", () => {
    const chat = responsesRequestToChat({
      model: "m",
      input: [
        { role: "user", content: [{ type: "input_text", text: "hi" }] },
        { type: "function_call", call_id: "c1", name: "f", arguments: "{}" },
        { type: "function_call_output", call_id: "c1", output: "ok" },
      ],
      max_output_tokens: 50,
      text: { format: { type: "json_schema", name: "x", schema: { type: "object" } } },
    });
    expect(chat.messages.map((m) => m.role)).toEqual(["user", "assistant", "tool"]);
    expect(chat.max_tokens).toBe(50);
    expect(chat.response_format).toMatchObject({ type: "json_schema", json_schema: { name: "x" } });
  });

  it("responses: rejects previous_response_id and built-in tools clearly", () => {
    expect(() => responsesRequestToChat({ model: "m", input: "x", previous_response_id: "r" })).toThrow(/previous_response_id/);
    expect(() => responsesRequestToChat({ model: "m", input: "x", tools: [{ type: "web_search" }] })).toThrow(/web_search/);
  });
});
