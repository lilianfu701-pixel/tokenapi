import type { Metadata } from "next";
import Link from "next/link";
import { toPublicModel } from "@/lib/gateway/models";
import { createNeonRepo } from "@/lib/gateway/repo";
import { API_BASE, CONTACT_EMAIL, SiteFooter, SiteHeader } from "../_site/site-chrome";
import { ModelTable, type PublicModel } from "./model-table";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Models & pricing | TokenAPI",
  description: "TokenAPI models with capabilities, context length and per-token prices. One API key, OpenAI-compatible.",
};

async function loadModels(): Promise<{ models: PublicModel[]; failed: boolean }> {
  try {
    const aliases = await createNeonRepo().listPublicAliases();
    return { models: aliases.map((a) => toPublicModel(a)), failed: false };
  } catch (e) {
    console.error("[models page] failed to load models", e);
    return { models: [], failed: true };
  }
}

export default async function ModelsPage() {
  const { models, failed } = await loadModels();

  return (
    <main className="site-shell">
      <SiteHeader subtitle="Models & pricing" />

      <section className="page-hero">
        <span className="eyebrow">Models</span>
        <h1>Models and per-token prices</h1>
        <p>
          Call any model below with the same API key and base URL <code>{API_BASE}</code>. Prices are in USD per
          million tokens and are charged on actual usage.
        </p>
      </section>

      {failed ? (
        <p className="notice notice-error" role="alert">The model list is temporarily unavailable. Please try again shortly.</p>
      ) : models.length === 0 ? (
        <section className="notice">
          <h2>Models are being added.</h2>
          <p>
            We are onboarding the first models now. Email <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> for early access.
          </p>
        </section>
      ) : (
        <ModelTable models={models} />
      )}

      <section className="docs-card models-api-note">
        <span className="docs-kicker">Programmatic access</span>
        <h2>The same list is available as JSON.</h2>
        <pre>{`curl ${API_BASE}/models`}</pre>
        <p>
          Use the <code>id</code> as the <code>model</code> parameter. See the <Link href="/docs">docs</Link> for request examples.
        </p>
      </section>

      <SiteFooter />
    </main>
  );
}
