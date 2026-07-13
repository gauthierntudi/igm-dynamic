import type { Metadata } from "next";

import { CmsNewsArticleView } from "@/components/cms/CmsNewsArticleView";
import { NewsListingView } from "@/components/cms/news-listing/NewsListingView";
import { getNewsListing } from "@/lib/cms/client";
import { tryResolveHeroMediaSrc } from "@/lib/cms/resolveHeroMediaSrc";
import { getMessages } from "@/i18n/messages";
import { ARTICLE_RELATED_NEWS_MAX_ITEMS } from "@/lib/newsDisplay";
import { PRESS_RELEASE_CATEGORY, PRESS_REVIEW_CATEGORY } from "@/lib/newsCategories";
import {
  NEWS_LISTING_HERO_COUNT,
  NEWS_LISTING_PAGE_SIZE,
} from "@/lib/newsListing";

import { cmsMediaForOg, siteMeta } from "../siteMeta";
import type { SiteRoute } from "../types";

type NewsArticleRoute = Extract<SiteRoute, { kind: "news-article" }>;
type NewsListingRoute = Extract<SiteRoute, { kind: "news-listing" }>;

/** Catégories exclues du carrousel hero Actualités. */
const NEWS_HERO_EXCLUDE_CATEGORIES = [PRESS_REVIEW_CATEGORY, PRESS_RELEASE_CATEGORY];

export async function renderNewsArticleRoute(route: NewsArticleRoute) {
  const { locale, article } = route;
  const related = await getNewsListing(locale, {
    page: 1,
    limit: ARTICLE_RELATED_NEWS_MAX_ITEMS + 1,
    excludeCategory: PRESS_REVIEW_CATEGORY,
  });

  return <CmsNewsArticleView article={article} related={related.docs} locale={locale} />;
}

export async function renderNewsListingRoute(route: NewsListingRoute) {
  const { locale, page, q } = route;
  const [listing, heroListing] = await Promise.all([
    getNewsListing(locale, {
      page,
      limit: NEWS_LISTING_PAGE_SIZE,
      q: q || undefined,
      excludeCategory: PRESS_REVIEW_CATEGORY,
    }),
    q
      ? Promise.resolve({ docs: [], totalDocs: 0, totalPages: 0, page: 1 })
      : getNewsListing(locale, {
          page: 1,
          limit: NEWS_LISTING_HERO_COUNT,
          excludeCategories: NEWS_HERO_EXCLUDE_CATEGORIES,
        }),
  ]);

  return (
    <NewsListingView
      locale={locale}
      heroArticles={heroListing.docs}
      articles={listing.docs}
      page={listing.page}
      totalPages={listing.totalPages}
      totalDocs={listing.totalDocs}
      q={q || undefined}
    />
  );
}

export async function buildNewsArticleMetadata(route: NewsArticleRoute): Promise<Metadata> {
  const { locale, pathSegments, article } = route;
  return siteMeta(locale, pathSegments, {
    title: article.seoTitle?.trim() || `${article.title} — IGM`,
    description: article.seoDescription?.trim() || article.excerpt?.trim(),
    type: "article",
    publishedTime: article.publishedAt,
    image: tryResolveHeroMediaSrc(cmsMediaForOg(article.cover)),
    imageAlt: article.title,
  });
}

export async function buildNewsListingMetadata(route: NewsListingRoute): Promise<Metadata> {
  const { locale, pathSegments } = route;
  const m = getMessages(locale).newsListing;
  return siteMeta(locale, pathSegments, {
    title: m.metaTitle,
    description: m.metaDescription,
  });
}
