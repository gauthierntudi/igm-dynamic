import type { Metadata } from "next";

import { CmsNewsArticleView } from "@/components/cms/CmsNewsArticleView";
import { NewsListingView } from "@/components/cms/news-listing/NewsListingView";
import { getNewsListing } from "@/lib/cms/client";
import { getPageHeroesSettings } from "@/lib/cms/page-heroes/getPageHeroesSettings";
import { resolvePageHeroImage } from "@/lib/cms/page-heroes/resolvePageHero";
import { tryResolveHeroMediaSrc } from "@/lib/cms/resolveHeroMediaSrc";
import { getMessages } from "@/i18n/messages";
import { ARTICLE_RELATED_NEWS_MAX_ITEMS } from "@/lib/newsDisplay";
import { PRESS_REVIEW_CATEGORY } from "@/lib/newsCategories";
import { NEWS_LISTING_PAGE_SIZE } from "@/lib/newsListing";

import { cmsMediaForOg, siteMeta } from "../siteMeta";
import type { SiteRoute } from "../types";

type PressReviewArticleRoute = Extract<SiteRoute, { kind: "press-review-article" }>;
type PressReviewListingRoute = Extract<SiteRoute, { kind: "press-review-listing" }>;

export async function renderPressReviewArticleRoute(route: PressReviewArticleRoute) {
  const { locale, article } = route;
  const related = await getNewsListing(locale, {
    page: 1,
    limit: ARTICLE_RELATED_NEWS_MAX_ITEMS + 1,
    category: PRESS_REVIEW_CATEGORY,
  });

  return (
    <CmsNewsArticleView
      article={article}
      related={related.docs}
      locale={locale}
      variant="pressReview"
    />
  );
}

export async function renderPressReviewListingRoute(route: PressReviewListingRoute) {
  const { locale, page, q } = route;
  const [listing, pageHeroes] = await Promise.all([
    getNewsListing(locale, {
      page,
      limit: NEWS_LISTING_PAGE_SIZE,
      q: q || undefined,
      category: PRESS_REVIEW_CATEGORY,
    }),
    getPageHeroesSettings(locale),
  ]);

  return (
    <NewsListingView
      locale={locale}
      variant="pressReview"
      heroImageSrc={resolvePageHeroImage(pageHeroes, "pressReview")}
      articles={listing.docs}
      page={listing.page}
      totalPages={listing.totalPages}
      totalDocs={listing.totalDocs}
      q={q || undefined}
    />
  );
}

export async function buildPressReviewArticleMetadata(
  route: PressReviewArticleRoute,
): Promise<Metadata> {
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

export async function buildPressReviewListingMetadata(
  route: PressReviewListingRoute,
): Promise<Metadata> {
  const { locale, pathSegments } = route;
  const m = getMessages(locale).pressReviewListing;
  const pageHeroes = await getPageHeroesSettings(locale);
  return siteMeta(locale, pathSegments, {
    title: m.metaTitle,
    description: m.metaDescription,
    image: resolvePageHeroImage(pageHeroes, "pressReview"),
    imageAlt: m.exploreTitle,
  });
}
