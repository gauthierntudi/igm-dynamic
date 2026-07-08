import { unstable_cache } from "next/cache";

import { DEFAULT_LOCALE, type SupportedLocale } from "@/i18n/locales";

import { mergeDeployedProvinceAssignments } from "@/lib/cartography/provinceAssignments";

import { hydrateMediaRef } from "../hydrateMediaRefs";
import { getPayloadClient } from "../payload";
import type { CmsCartographySettings } from "./types";

function hasDatabase(): boolean {
  return Boolean(process.env.DATABASE_URI?.trim() || process.env.DATABASE_URL?.trim());
}

async function hydrateInspectors(settings: CmsCartographySettings): Promise<CmsCartographySettings> {
  const provinceAssignments = settings.provinceAssignments ?? [];
  const next = await Promise.all(
    provinceAssignments.map(async (assignment) => {
      const inspectors = assignment.inspectors ?? [];
      const hydratedInspectors = await Promise.all(
        inspectors.map(async (inspector) => ({
          ...inspector,
          photo:
            typeof inspector.photo === "object"
              ? inspector.photo
              : await hydrateMediaRef(inspector.photo ?? null),
        })),
      );
      return { ...assignment, inspectors: hydratedInspectors };
    }),
  );

  return {
    ...settings,
    provinceAssignments: mergeDeployedProvinceAssignments(next),
  };
}

async function fetchCartographySettings(locale: SupportedLocale): Promise<CmsCartographySettings | null> {
  if (!hasDatabase()) return null;

  try {
    const payload = await getPayloadClient();
    const settings = (await payload.findGlobal({
      slug: "cartography-settings" as never,
      depth: 2,
      locale,
    })) as CmsCartographySettings;

    return hydrateInspectors(settings);
  } catch (err) {
    console.error("[cms] getCartographySettings:", err);
    return null;
  }
}

const cacheByLocale = {
  fr: unstable_cache(
    () => fetchCartographySettings("fr"),
    ["cms-global-cartography-settings", "fr"],
    { tags: ["global:cartography-settings", "global:cartography-settings:fr"] },
  ),
  en: unstable_cache(
    () => fetchCartographySettings("en"),
    ["cms-global-cartography-settings", "en"],
    { tags: ["global:cartography-settings", "global:cartography-settings:en"] },
  ),
} satisfies Record<SupportedLocale, () => Promise<CmsCartographySettings | null>>;

export async function getCartographySettings(
  locale: SupportedLocale = DEFAULT_LOCALE,
): Promise<CmsCartographySettings | null> {
  if (process.env.NODE_ENV === "development") {
    return fetchCartographySettings(locale);
  }

  return cacheByLocale[locale]();
}
