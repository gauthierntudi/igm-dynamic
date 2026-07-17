import { unstable_cache } from "next/cache";

import type { SupportedLocale } from "@/i18n/locales";

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
      depth: 0,
      limit: 200,
      sort: "order,-publishedAt",
      where: {
        _status: { equals: "published" },
      },
    });

    return result.docs as CmsMediaGalleryItem[];
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
        ["cms-media-gallery-videos-v2", locale],
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
