import type { Locale } from "@/lib/i18n/locales";
import { de } from "./de";
import { en } from "./en";
import { es } from "./es";
import { fr } from "./fr";
import { ja } from "./ja";
import { ko } from "./ko";
import { pt } from "./pt";
import { ru } from "./ru";
import type { Messages } from "./types";
import { zh } from "./zh";
import { zhTW } from "./zh-tw";

// Record<Locale, Messages>: adding a locale to lib/i18n/locales.ts without a messages file fails to compile.
export const MESSAGES: Record<Locale, Messages> = { en, zh, "zh-tw": zhTW, ja, ko, es, fr, de, pt, ru };

export function getMessages(locale: Locale): Messages {
  return MESSAGES[locale];
}

export { fmt } from "./types";
export type { Messages } from "./types";
