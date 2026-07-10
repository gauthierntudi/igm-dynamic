import { SUPPORTED_LOCALES, parseLocaleFromSegments, type SupportedLocale } from "@/i18n/locales";
import {
  hrefForNewsArticle,
  hrefForPressReviewArticle,
  hrefForRoute,
  parseNewsArticleSlug,
  parsePressReviewArticleSlug,
  switchLocaleHref,
} from "@/i18n/paths";
import { PRESS_REVIEW_CATEGORY } from "@/lib/newsCategories";
import { getNewsById, getNewsByPublishedAt, getNewsBySlug } from "@/lib/cms/client";
import type { CmsNews } from "@/lib/cms/types";

function hrefsFromSwitch(pathname: string): Record<SupportedLocale, string> {
  return Object.fromEntries(
    SUPPORTED_LOCALES.map((locale) => [locale, switchLocaleHref(pathname, locale)]),
  ) as Record<SupportedLocale, string>;
}

async function resolveNewsArticleHref(
  article: CmsNews,
  sourceLocale: SupportedLocale,
  targetLocale: SupportedLocale,
): Promise<string> {
  const byId = await getNewsById(article.id, targetLocale);
  const isPressReview = article.category === PRESS_REVIEW_CATEGORY;
  const hrefForArticle = (slug: string) =>
    isPressReview
      ? hrefForPressReviewArticle(slug, targetLocale)
      : hrefForNewsArticle(slug, targetLocale);
  const listingFallback = () =>
    isPressReview
      ? hrefForRoute("pressReview", targetLocale)
      : hrefForRoute("news", targetLocale);

  if (byId?.slug && (targetLocale === sourceLocale || byId.slug !== article.slug)) {
    return hrefForArticle(byId.slug);
  }

  const sibling = await getNewsByPublishedAt(article.publishedAt, targetLocale, article.id);
  if (sibling?.slug) {
    return hrefForArticle(sibling.slug);
  }

  if (byId?.slug) {
    return hrefForArticle(byId.slug);
  }

  return listingFallback();
}

/** URLs FR/EN pour la page courante (résout les slugs d’articles via l’ID Payload). */
export async function resolveAlternateLocaleHrefs(
  pathname: string,
): Promise<Record<SupportedLocale, string>> {
  const segments = pathname.split("/").filter(Boolean);
  const { locale: currentLocale, pathSegments } = parseLocaleFromSegments(segments);
  const articleSlug =
    parseNewsArticleSlug(pathSegments, currentLocale) ??
    parsePressReviewArticleSlug(pathSegments, currentLocale);

  if (!articleSlug) {
    return hrefsFromSwitch(pathname);
  }

  const article = await getNewsBySlug(articleSlug, currentLocale);
  if (!article) {
    return hrefsFromSwitch(pathname);
  }

  const hrefs = {} as Record<SupportedLocale, string>;
  await Promise.all(
    SUPPORTED_LOCALES.map(async (locale) => {
      hrefs[locale] = await resolveNewsArticleHref(article, currentLocale, locale);
    }),
  );

  return hrefs;
}
