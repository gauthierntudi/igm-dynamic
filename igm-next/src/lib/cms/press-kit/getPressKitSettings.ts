import { unstable_cache } from "next/cache";

import { DEFAULT_LOCALE, type SupportedLocale } from "@/i18n/locales";

import { hydrateMediaFields } from "../hydrateMediaRefs";
import { getPayloadClient } from "../payload";
import type { CmsPressKitPage } from "./types";

function hasDatabase(): boolean {
  return Boolean(process.env.DATABASE_URI?.trim() || process.env.DATABASE_URL?.trim());
}

async function fetchPressKitSettings(locale: SupportedLocale): Promise<CmsPressKitPage | null> {
  if (!hasDatabase()) return null;
  try {
    const payload = await getPayloadClient();
    const settings = (await payload.findGlobal({
      slug: "press-kit-page",
      depth: 2,
      locale,
    })) as CmsPressKitPage;
    return hydrateMediaFields(settings, ["presentationPdf"]);
  } catch (err) {
    console.error("[cms] getPressKitSettings:", err);
    return null;
  }
}

const cacheByLocale = {
  fr: unstable_cache(() => fetchPressKitSettings("fr"), ["cms-global-press-kit-page", "fr"], {
    tags: ["global:press-kit-page", "global:press-kit-page:fr"],
  }),
  en: unstable_cache(() => fetchPressKitSettings("en"), ["cms-global-press-kit-page", "en"], {
    tags: ["global:press-kit-page", "global:press-kit-page:en"],
  }),
} satisfies Record<SupportedLocale, () => Promise<CmsPressKitPage | null>>;

export async function getPressKitSettings(
  locale: SupportedLocale = DEFAULT_LOCALE,
): Promise<CmsPressKitPage | null> {
  if (process.env.NODE_ENV === "development") {
    return fetchPressKitSettings(locale);
  }
  return cacheByLocale[locale]();
}
