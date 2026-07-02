import { getNewsBySlug } from "@/lib/cms/client";
import { isNewsListingPath, parseNewsArticleSlug } from "@/i18n/paths";

import type { RouteMatcher } from "../types";

export const matchNewsRoutes: RouteMatcher = async (ctx, input) => {
  const { locale, pathSegments } = ctx;

  const newsArticleSlug = parseNewsArticleSlug(pathSegments, locale);
  if (newsArticleSlug) {
    const article = await getNewsBySlug(newsArticleSlug, locale);
    if (article) {
      return { kind: "news-article", article, ...ctx };
    }
  }

  if (isNewsListingPath(pathSegments, locale)) {
    const page = Math.max(1, Number.parseInt(input.page ?? "1", 10) || 1);
    const q = input.q?.trim() ?? "";
    return { kind: "news-listing", page, q, ...ctx };
  }

  return null;
};
