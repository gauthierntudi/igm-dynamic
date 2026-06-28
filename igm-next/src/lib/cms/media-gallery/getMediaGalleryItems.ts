import { unstable_cache } from "next/cache";

import type { SupportedLocale } from "@/i18n/locales";

import { hydrateMediaFields } from "../hydrateMediaRefs";
import { getPayloadClient } from "../payload";
import type { CmsMediaGalleryItem } from "./types";

function hasDatabase(): boolean {
  return Boolean(process.env.DATABASE_URI?.trim() || process.env.DATABASE_URL?.trim());
}

async function fetchMediaGalleryVideos(locale: SupportedLocale): Promise<CmsMediaGalleryItem[]> {
  if (!hasDatabase()) return [];

  try {
    const payload = await getPayloadClient();
    const result = await payload.find({
      collection: "media-gallery-items",
      locale,
      depth: 2,
      limit: 200,
      sort: "-publishedAt,order",
      where: {
        _status: { equals: "published" },
      },
    });

    const docs = result.docs as CmsMediaGalleryItem[];
    const hydrated = await Promise.all(
      docs.map((doc) => hydrateMediaFields(doc, ["media"] as (keyof CmsMediaGalleryItem)[])),
    );

    return hydrated.filter((doc): doc is CmsMediaGalleryItem => doc != null);
  } catch (error) {
    console.error("[cms] getMediaGalleryVideos:", error);
    return [];
  }
}

const cacheByLocale = new Map<string, () => Promise<CmsMediaGalleryItem[]>>();

function getCachedFetcher(locale: SupportedLocale) {
  const key = locale;
  if (!cacheByLocale.has(key)) {
    cacheByLocale.set(
      key,
      unstable_cache(
        () => fetchMediaGalleryVideos(locale),
        ["cms-media-gallery-videos", locale],
        {
          tags: [
            "collection:media-gallery-items",
            `collection:media-gallery-items:${locale}`,
            "media-gallery:videos",
            `media-gallery:videos:${locale}`,
          ],
        },
      ),
    );
  }
  return cacheByLocale.get(key)!;
}

export async function getMediaGalleryVideos(
  locale: SupportedLocale,
): Promise<CmsMediaGalleryItem[]> {
  if (process.env.NODE_ENV === "development") {
    return fetchMediaGalleryVideos(locale);
  }
  return getCachedFetcher(locale)();
}

/** @deprecated Utiliser getMediaGalleryVideos */
export async function getMediaGalleryItems(
  _category: "videos",
  locale: SupportedLocale,
): Promise<CmsMediaGalleryItem[]> {
  return getMediaGalleryVideos(locale);
}
