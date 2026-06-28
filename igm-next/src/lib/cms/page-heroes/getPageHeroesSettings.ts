import { unstable_cache } from "next/cache";

import { DEFAULT_LOCALE, type SupportedLocale } from "@/i18n/locales";
import {
  PAGE_HERO_CTA_FIELD,
  PAGE_HERO_CTA_ROUTE_KEYS,
  PAGE_HERO_FIELD,
  PAGE_HERO_ROUTE_KEYS,
} from "@/lib/page-heroes/constants";

import { hydrateMediaFields } from "../hydrateMediaRefs";
import { getPayloadClient } from "../payload";
import type { CmsPageHeroesSettings } from "./types";

function pageHeroMediaFields(): (keyof CmsPageHeroesSettings)[] {
  return [
    ...PAGE_HERO_ROUTE_KEYS.map((key) => PAGE_HERO_FIELD[key]),
    ...PAGE_HERO_CTA_ROUTE_KEYS.map((key) => PAGE_HERO_CTA_FIELD[key]),
  ];
}

function hasDatabase(): boolean {
  return Boolean(process.env.DATABASE_URI?.trim() || process.env.DATABASE_URL?.trim());
}

async function fetchPageHeroesSettings(
  locale: SupportedLocale,
): Promise<CmsPageHeroesSettings | null> {
  if (!hasDatabase()) return null;
  try {
    const payload = await getPayloadClient();
    const settings = (await payload.findGlobal({
      slug: "page-heroes",
      depth: 2,
      locale,
    })) as CmsPageHeroesSettings;
    return hydrateMediaFields(settings, pageHeroMediaFields());
  } catch (err) {
    console.error("[cms] getPageHeroesSettings:", err);
    return null;
  }
}

const cacheByLocale = {
  fr: unstable_cache(() => fetchPageHeroesSettings("fr"), ["cms-global-page-heroes", "fr"], {
    tags: ["global:page-heroes", "global:page-heroes:fr"],
  }),
  en: unstable_cache(() => fetchPageHeroesSettings("en"), ["cms-global-page-heroes", "en"], {
    tags: ["global:page-heroes", "global:page-heroes:en"],
  }),
} satisfies Record<SupportedLocale, () => Promise<CmsPageHeroesSettings | null>>;

export async function getPageHeroesSettings(
  locale: SupportedLocale = DEFAULT_LOCALE,
): Promise<CmsPageHeroesSettings | null> {
  if (process.env.NODE_ENV === "development") {
    return fetchPageHeroesSettings(locale);
  }
  return cacheByLocale[locale]();
}
