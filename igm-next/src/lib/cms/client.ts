import { unstable_cache } from "next/cache";

import { DEFAULT_LOCALE, type SupportedLocale } from "@/i18n/locales";

import { getPayloadClient } from "./payload";
import type { CmsHome } from "./home/types";
import type { CmsNews, CmsPage, CmsSiteSettings, CmsStat } from "./types";

function hasDatabase(): boolean {
  return Boolean(process.env.DATABASE_URI?.trim() || process.env.DATABASE_URL?.trim());
}

async function fetchWhoWeAre(locale: SupportedLocale) {
  if (!hasDatabase()) return null;
  try {
    const payload = await getPayloadClient();
    return (await payload.findGlobal({
      slug: "who-we-are",
      depth: 2,
      locale,
    })) as import("./who-we-are/types").CmsWhoWeAre;
  } catch (err) {
    console.error("[cms] getWhoWeAre:", err);
    return null;
  }
}

async function fetchHome(locale: SupportedLocale): Promise<CmsHome | null> {
  if (!hasDatabase()) return null;
  try {
    const payload = await getPayloadClient();
    return (await payload.findGlobal({ slug: "home", depth: 2, locale })) as CmsHome;
  } catch (err) {
    console.error("[cms] getHome:", err);
    return null;
  }
}

async function fetchStats(locale: SupportedLocale): Promise<CmsStat[]> {
  if (!hasDatabase()) return [];
  try {
    const payload = await getPayloadClient();
    const result = await payload.find({
      collection: "stats",
      limit: 100,
      sort: "order",
      locale,
    });
    return result.docs as CmsStat[];
  } catch (err) {
    console.error("[cms] getStats:", err);
    return [];
  }
}

async function fetchPublishedNewsPage(
  locale: SupportedLocale,
  options: { page?: number; limit?: number; q?: string } = {},
): Promise<{ docs: CmsNews[]; totalDocs: number; totalPages: number; page: number }> {
  if (!hasDatabase()) {
    return { docs: [], totalDocs: 0, totalPages: 0, page: 1 };
  }

  const limit = Math.max(1, options.limit ?? 12);
  const page = Math.max(1, options.page ?? 1);
  const q = options.q?.trim();

  try {
    const payload = await getPayloadClient();
    const where = q
      ? {
          and: [
            { _status: { equals: "published" as const } },
            {
              or: [
                { title: { contains: q } },
                { excerpt: { contains: q } },
                { categoryCustom: { contains: q } },
              ],
            },
          ],
        }
      : { _status: { equals: "published" as const } };

    const result = await payload.find({
      collection: "news",
      limit,
      page,
      sort: "-publishedAt",
      depth: 1,
      locale,
      where,
    });

    return {
      docs: result.docs as CmsNews[],
      totalDocs: result.totalDocs,
      totalPages: result.totalPages,
      page: result.page ?? page,
    };
  } catch (err) {
    console.error("[cms] fetchPublishedNewsPage:", err);
    return { docs: [], totalDocs: 0, totalPages: 0, page: 1 };
  }
}

async function fetchNewsBySlug(slug: string, locale: SupportedLocale): Promise<CmsNews | null> {
  if (!hasDatabase()) return null;
  try {
    const payload = await getPayloadClient();
    const result = await payload.find({
      collection: "news",
      where: {
        and: [{ slug: { equals: slug } }, { _status: { equals: "published" } }],
      },
      limit: 1,
      depth: 1,
      locale,
    });
    return (result.docs[0] as CmsNews | undefined) ?? null;
  } catch (err) {
    console.error("[cms] getNewsBySlug:", err);
    return null;
  }
}

async function fetchNewsById(id: number, locale: SupportedLocale): Promise<CmsNews | null> {
  if (!hasDatabase()) return null;
  try {
    const payload = await getPayloadClient();
    const doc = await payload.findByID({
      collection: "news",
      id,
      depth: 1,
      locale,
    });
    if (!doc || doc._status !== "published") return null;
    return doc as CmsNews;
  } catch (err) {
    console.error("[cms] getNewsById:", err);
    return null;
  }
}

async function fetchNewsByPublishedAt(
  publishedAt: string,
  locale: SupportedLocale,
  excludeId?: number,
): Promise<CmsNews | null> {
  if (!hasDatabase()) return null;
  try {
    const payload = await getPayloadClient();
    const result = await payload.find({
      collection: "news",
      where: {
        and: [
          { publishedAt: { equals: publishedAt } },
          { _status: { equals: "published" } },
          ...(excludeId != null ? [{ id: { not_equals: excludeId } }] : []),
        ],
      },
      limit: 1,
      depth: 1,
      locale,
    });
    return (result.docs[0] as CmsNews | undefined) ?? null;
  } catch (err) {
    console.error("[cms] getNewsByPublishedAt:", err);
    return null;
  }
}

async function fetchPageBySlug(slug: string, locale: SupportedLocale): Promise<CmsPage | null> {
  if (!hasDatabase()) return null;
  try {
    const payload = await getPayloadClient();
    const result = await payload.find({
      collection: "pages",
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 1,
      locale,
    });
    return (result.docs[0] as CmsPage | undefined) ?? null;
  } catch (err) {
    console.error("[cms] getPageBySlug:", err);
    return null;
  }
}

async function fetchSiteSettings(locale: SupportedLocale): Promise<CmsSiteSettings | null> {
  if (!hasDatabase()) return null;
  try {
    const payload = await getPayloadClient();
    return (await payload.findGlobal({ slug: "site-settings", locale })) as CmsSiteSettings;
  } catch (err) {
    console.error("[cms] getSiteSettings:", err);
    return null;
  }
}

async function fetchHomePageBundleUncached(maxNews: number, locale: SupportedLocale) {
  if (!hasDatabase()) {
    return { stats: [] as CmsStat[], home: null as CmsHome | null, news: [] as CmsNews[] };
  }

  try {
    const payload = await getPayloadClient();
    const [statsResult, home, newsResult] = await Promise.all([
      payload.find({ collection: "stats", limit: 100, sort: "order", locale }),
      payload.findGlobal({ slug: "home", depth: 2, locale }),
      payload.find({
        collection: "news",
        limit: maxNews,
        sort: "-publishedAt",
        depth: 1,
        locale,
        where: { _status: { equals: "published" } },
      }),
    ]);

    return {
      stats: statsResult.docs as CmsStat[],
      home: home as CmsHome,
      news: newsResult.docs as CmsNews[],
    };
  } catch (err) {
    console.error("[cms] getHomePageBundle:", err);
    return { stats: [] as CmsStat[], home: null as CmsHome | null, news: [] as CmsNews[] };
  }
}

const whoWeAreCacheByLocale = {
  fr: unstable_cache(() => fetchWhoWeAre("fr"), ["cms-global-who-we-are", "fr"], {
    tags: ["global:who-we-are", "global:who-we-are:fr"],
  }),
  en: unstable_cache(() => fetchWhoWeAre("en"), ["cms-global-who-we-are", "en"], {
    tags: ["global:who-we-are", "global:who-we-are:en"],
  }),
} satisfies Record<SupportedLocale, () => Promise<import("./who-we-are/types").CmsWhoWeAre | null>>;

const homeCacheByLocale = {
  fr: unstable_cache(() => fetchHome("fr"), ["cms-global-home", "fr"], {
    tags: ["global:home", "global:home:fr"],
  }),
  en: unstable_cache(() => fetchHome("en"), ["cms-global-home", "en"], {
    tags: ["global:home", "global:home:en"],
  }),
} satisfies Record<SupportedLocale, () => Promise<CmsHome | null>>;

const statsCacheByLocale = {
  fr: unstable_cache(() => fetchStats("fr"), ["cms-collection-stats", "fr"], {
    tags: ["collection:stats", "collection:stats:fr"],
  }),
  en: unstable_cache(() => fetchStats("en"), ["cms-collection-stats", "en"], {
    tags: ["collection:stats", "collection:stats:en"],
  }),
} satisfies Record<SupportedLocale, () => Promise<CmsStat[]>>;

const siteSettingsCacheByLocale = {
  fr: unstable_cache(() => fetchSiteSettings("fr"), ["cms-global-site-settings", "fr"], {
    tags: ["global:site-settings", "global:site-settings:fr"],
  }),
  en: unstable_cache(() => fetchSiteSettings("en"), ["cms-global-site-settings", "en"], {
    tags: ["global:site-settings", "global:site-settings:en"],
  }),
} satisfies Record<SupportedLocale, () => Promise<CmsSiteSettings | null>>;

const homePageBundleCacheByLocale = {
  fr: unstable_cache(() => fetchHomePageBundleUncached(12, "fr"), ["cms-home-page-bundle", "fr"], {
    tags: ["global:home", "global:home:fr", "collection:stats", "collection:stats:fr", "collection:news", "collection:news:fr"],
  }),
  en: unstable_cache(() => fetchHomePageBundleUncached(12, "en"), ["cms-home-page-bundle", "en"], {
    tags: ["global:home", "global:home:en", "collection:stats", "collection:stats:en", "collection:news", "collection:news:en"],
  }),
} satisfies Record<
  SupportedLocale,
  () => Promise<{ stats: CmsStat[]; home: CmsHome | null; news: CmsNews[] }>
>;

export async function getWhoWeAre(
  locale: SupportedLocale = DEFAULT_LOCALE,
): Promise<import("./who-we-are/types").CmsWhoWeAre | null> {
  if (process.env.NODE_ENV === "development") {
    return fetchWhoWeAre(locale);
  }
  return whoWeAreCacheByLocale[locale]();
}

export async function getHome(locale: SupportedLocale = DEFAULT_LOCALE): Promise<CmsHome | null> {
  return homeCacheByLocale[locale]();
}

export async function getStats(locale: SupportedLocale = DEFAULT_LOCALE): Promise<CmsStat[]> {
  return statsCacheByLocale[locale]();
}

export async function getSiteSettings(
  locale: SupportedLocale = DEFAULT_LOCALE,
): Promise<CmsSiteSettings | null> {
  return siteSettingsCacheByLocale[locale]();
}

export async function getPublishedNews(
  limit = 6,
  locale: SupportedLocale = DEFAULT_LOCALE,
): Promise<CmsNews[]> {
  const bundle = await homePageBundleCacheByLocale[locale]();
  return bundle.news.slice(0, limit);
}

export async function getNewsListing(
  locale: SupportedLocale = DEFAULT_LOCALE,
  options: { page?: number; limit?: number; q?: string } = {},
) {
  const page = Math.max(1, options.page ?? 1);
  const limit = options.limit ?? 12;
  const q = options.q?.trim() ?? "";

  const cached = unstable_cache(
    () => fetchPublishedNewsPage(locale, { page, limit, q: q || undefined }),
    ["cms-news-listing", locale, String(page), String(limit), q],
    {
      tags: ["collection:news", `collection:news:${locale}`, "collection:news:listing"],
    },
  );
  return cached();
}

export async function getHomePageBundle(locale: SupportedLocale = DEFAULT_LOCALE) {
  return homePageBundleCacheByLocale[locale]();
}

export async function getNewsBySlug(
  slug: string,
  locale: SupportedLocale = DEFAULT_LOCALE,
): Promise<CmsNews | null> {
  const cached = unstable_cache(
    () => fetchNewsBySlug(slug, locale),
    ["cms-news", slug, locale],
    {
      tags: ["collection:news", `news:slug:${slug}`, `news:slug:${slug}:${locale}`],
    },
  );
  return cached();
}

export async function getNewsById(
  id: number,
  locale: SupportedLocale = DEFAULT_LOCALE,
): Promise<CmsNews | null> {
  const cached = unstable_cache(
    () => fetchNewsById(id, locale),
    ["cms-news-id", String(id), locale],
    {
      tags: ["collection:news", `news:id:${id}`, `news:id:${id}:${locale}`],
    },
  );
  return cached();
}

export async function getNewsByPublishedAt(
  publishedAt: string,
  locale: SupportedLocale = DEFAULT_LOCALE,
  excludeId?: number,
): Promise<CmsNews | null> {
  const cached = unstable_cache(
    () => fetchNewsByPublishedAt(publishedAt, locale, excludeId),
    ["cms-news-date", publishedAt, locale, String(excludeId ?? "")],
    {
      tags: ["collection:news", `news:date:${publishedAt}`, `news:date:${publishedAt}:${locale}`],
    },
  );
  return cached();
}

export async function getPageBySlug(
  slug: string,
  locale: SupportedLocale = DEFAULT_LOCALE,
): Promise<CmsPage | null> {
  const cached = unstable_cache(
    () => fetchPageBySlug(slug, locale),
    ["cms-page", slug, locale],
    {
      tags: ["collection:pages", `page:slug:${slug}`, `page:slug:${slug}:${locale}`],
    },
  );
  return cached();
}

export function isCmsConfigured(): boolean {
  return hasDatabase() && Boolean(process.env.PAYLOAD_SECRET?.trim());
}
