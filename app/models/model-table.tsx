import type { toPublicModel } from "@/lib/gateway/models";

const CAPABILITY_LABELS: Record<string, string> = {
  streaming: "Streaming",
  tools: "Tool calling",
  vision: "Vision",
  json_output: "JSON output",
  reasoning: "Reasoning",
};

export type PublicModel = ReturnType<typeof toPublicModel>;

/** Exact price (no rounding): what is shown is what is billed. */
export function price(perMillion: number | undefined) {
  if (perMillion == null) return "—";
  const exact = perMillion.toFixed(6).replace(/0+$/, "").replace(/\.$/, "");
  const [whole, frac = ""] = exact.split(".");
  return `$${whole}.${frac.padEnd(2, "0")}`;
}

function context(n: number | null) {
  if (!n) return "—";
  return n >= 1_000_000 ? `${(n / 1_000_000).toFixed(n % 1_000_000 ? 1 : 0)}M` : `${Math.round(n / 1000)}K`;
}

export function ModelTable({ models }: { models: PublicModel[] }) {
  return (
    <section className="model-list" aria-label="Available models">
      <div className="model-row model-row-head" aria-hidden="true">
        <span>Model</span>
        <span>Capabilities</span>
        <span>Context</span>
        <span>Input / 1M</span>
        <span>Output / 1M</span>
      </div>
      {models.map((m) => (
        <article key={m.id} className="model-row">
          <div className="model-name">
            <h2>{m.display_name}</h2>
            <code>{m.id}</code>
            {m.description ? <p>{m.description}</p> : null}
          </div>
          <ul className="cap-list" aria-label="Capabilities">
            {m.capabilities.map((c) => <li key={c}>{CAPABILITY_LABELS[c] ?? c}</li>)}
          </ul>
          <span className="model-cell" data-label="Context">{context(m.context_length)}</span>
          <span className="model-cell model-price" data-label="Input / 1M">{price(m.pricing?.input_per_million)}</span>
          <span className="model-cell model-price" data-label="Output / 1M">{price(m.pricing?.output_per_million)}</span>
        </article>
      ))}
    </section>
  );
}
