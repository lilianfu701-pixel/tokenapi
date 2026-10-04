import type { Metadata } from "next";
import { alternates } from "@/app/_site/i18n";
import { getMessages } from "@/app/_site/locales";
import { ModelsPage } from "@/app/_site/models-page";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { ...getMessages("en").models.meta, alternates: alternates("en", "/models") };

export default function Page() {
  return <ModelsPage locale="en" />;
}
