// Public alias / display names must not borrow another vendor's model brand.
// e.g. a Qwen-backed alias named "Opus ..." or "GPT ..." would mislead customers
// about what they are paying for (and uses third-party trademarks).
// Generic product names ("premium-model", "TokenAPI Pro") are always fine.

const VENDOR_BRAND_TERMS: Record<string, string[]> = {
  anthropic: ["claude", "anthropic", "opus", "sonnet", "haiku"],
  openai: ["openai", "chatgpt", "gpt"],
  google: ["gemini", "gemma", "bard"],
  alibaba: ["qwen", "tongyi", "通义", "千问"],
  deepseek: ["deepseek"],
  moonshot: ["kimi", "moonshot"],
};

function containsTerm(text: string, term: string) {
  if (/[^\x00-\x7f]/.test(term)) return text.includes(term);
  return new RegExp(`(^|[^a-z])${term}([^a-z]|$)`, "i").test(text);
}

/** Returns an error message, or null when the name is acceptable for the backing vendor. */
export function checkBrandUsage(names: string[], backingVendor: string): string | null {
  const text = names.join(" ").toLowerCase();
  for (const [vendor, terms] of Object.entries(VENDOR_BRAND_TERMS)) {
    if (vendor === backingVendor) continue;
    const hit = terms.find((t) => containsTerm(text, t));
    if (hit) {
      return `Name uses "${hit}", a ${vendor} model brand, but this alias is served by a ${backingVendor} model. Use a neutral product name.`;
    }
  }
  return null;
}
