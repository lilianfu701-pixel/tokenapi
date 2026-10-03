import type { Metadata } from "next";
import { alternates } from "../../_site/i18n";
import { MODELS_TEXT, ModelsPage } from "../../_site/models-page";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { ...MODELS_TEXT.zh.meta, alternates: alternates("zh", "/models") };

export default function Page() {
  return <ModelsPage locale="zh" />;
}
