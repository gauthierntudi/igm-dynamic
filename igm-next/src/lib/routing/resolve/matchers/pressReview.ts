import { getNewsBySlug } from "@/lib/cms/client";
import {
  isPressReviewListingPath,
  parsePressReviewArticleSlug,
} from "@/i18n/paths";
import { PRESS_REVIEW_CATEGORY } from "@/lib/newsCategories";

import type { RouteMatcher } from "../types";

export const matchPressReviewRoutes: RouteMatcher = async (ctx, input) => {
  const { locale, pathSegments } = ctx;

  const articleSlug = parsePressReviewArticleSlug(pathSegments, locale);
  if (articleSlug) {
    const article = await getNewsBySlug(articleSlug, locale);
    if (article && article.category === PRESS_REVIEW_CATEGORY) {
      return { kind: "press-review-article", article, ...ctx };
    }
  }

  if (isPressReviewListingPath(pathSegments, locale)) {
    const page = Math.max(1, Number.parseInt(input.page ?? "1", 10) || 1);
    const q = input.q?.trim() ?? "";
    return { kind: "press-review-listing", page, q, ...ctx };
  }

  return null;
};
