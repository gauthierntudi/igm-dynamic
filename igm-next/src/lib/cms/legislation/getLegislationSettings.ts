import { unstable_cache } from "next/cache";

import { DEFAULT_LOCALE, type SupportedLocale } from "@/i18n/locales";

import { getPayloadClient } from "../payload";
import type { CmsLegislationSettings } from "./types";

function hasDatabase(): boolean {
  return Boolean(process.env.DATABASE_URI?.trim() || process.env.DATABASE_URL?.trim());
}

async function fetchLegislationSettings(
  locale: SupportedLocale,
): Promise<CmsLegislationSettings | null> {
  if (!hasDatabase()) return null;
  try {
    const payload = await getPayloadClient();
    return (await payload.findGlobal({
      slug: "legislation",
      depth: 2,
      locale,
    })) as CmsLegislationSettings;
  } catch (err) {
    console.error("[cms] getLegislationSettings:", err);
    return null;
  }
}

const cacheByLocale = {
  fr: unstable_cache(() => fetchLegislationSettings("fr"), ["cms-global-legislation", "fr"], {
    tags: ["global:legislation", "global:legislation:fr"],
  }),
  en: unstable_cache(() => fetchLegislationSettings("en"), ["cms-global-legislation", "en"], {
    tags: ["global:legislation", "global:legislation:en"],
  }),
} satisfies Record<SupportedLocale, () => Promise<CmsLegislationSettings | null>>;

export async function getLegislationSettings(
  locale: SupportedLocale = DEFAULT_LOCALE,
): Promise<CmsLegislationSettings | null> {
  if (process.env.NODE_ENV === "development") {
    return fetchLegislationSettings(locale);
  }
  return cacheByLocale[locale]();
}
