import { SUPPORTED_LOCALES, parseLocaleFromSegments, type SupportedLocale } from "@/i18n/locales";
import {
  hrefForNewsArticle,
  hrefForRoute,
  parseNewsArticleSlug,
  switchLocaleHref,
} from "@/i18n/paths";
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

  if (byId?.slug && (targetLocale === sourceLocale || byId.slug !== article.slug)) {
    return hrefForNewsArticle(byId.slug, targetLocale);
  }

  const sibling = await getNewsByPublishedAt(article.publishedAt, targetLocale, article.id);
  if (sibling?.slug) {
    return hrefForNewsArticle(sibling.slug, targetLocale);
  }

  if (byId?.slug) {
    return hrefForNewsArticle(byId.slug, targetLocale);
  }

  return hrefForRoute("news", targetLocale);
}

/** URLs FR/EN pour la page courante (résout les slugs d’articles via l’ID Payload). */
export async function resolveAlternateLocaleHrefs(
  pathname: string,
): Promise<Record<SupportedLocale, string>> {
  const segments = pathname.split("/").filter(Boolean);
  const { locale: currentLocale, pathSegments } = parseLocaleFromSegments(segments);
  const articleSlug = parseNewsArticleSlug(pathSegments, currentLocale);

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
