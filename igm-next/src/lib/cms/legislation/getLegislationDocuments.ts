import { unstable_cache } from "next/cache";

import type { SupportedLocale } from "@/i18n/locales";
import type { LegislationCategory } from "@/lib/legislation/constants";

import { getPayloadClient } from "../payload";
import type { CmsLegislationDocument } from "./types";

function hasDatabase(): boolean {
  return Boolean(process.env.DATABASE_URI?.trim() || process.env.DATABASE_URL?.trim());
}

async function fetchLegislationDocuments(
  category: LegislationCategory,
  locale: SupportedLocale,
): Promise<CmsLegislationDocument[]> {
  if (!hasDatabase()) return [];

  try {
    const payload = await getPayloadClient();
    const result = await payload.find({
      collection: "legislation-documents",
      locale,
      depth: 1,
      limit: 200,
      sort: "-publishedAt,order",
      where: {
        and: [
          { _status: { equals: "published" } },
          { category: { equals: category } },
        ],
      },
    });

    return result.docs as CmsLegislationDocument[];
  } catch (error) {
    console.error("[cms] getLegislationDocuments:", error);
    return [];
  }
}

const cacheByCategoryLocale = new Map<string, () => Promise<CmsLegislationDocument[]>>();

function getCachedFetcher(category: LegislationCategory, locale: SupportedLocale) {
  const key = `${category}:${locale}`;
  if (!cacheByCategoryLocale.has(key)) {
    cacheByCategoryLocale.set(
      key,
      unstable_cache(
        () => fetchLegislationDocuments(category, locale),
        ["cms-legislation-documents", category, locale],
        {
          tags: [
            "collection:legislation-documents",
            `collection:legislation-documents:${locale}`,
            `legislation:${category}`,
            `legislation:${category}:${locale}`,
          ],
        },
      ),
    );
  }
  return cacheByCategoryLocale.get(key)!;
}

export async function getLegislationDocuments(
  category: LegislationCategory,
  locale: SupportedLocale,
): Promise<CmsLegislationDocument[]> {
  return getCachedFetcher(category, locale)();
}
