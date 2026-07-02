import { getPageContent } from "@/lib/cms/getPageContent";
import { isPageHeroRouteKey } from "@/lib/page-heroes/constants";
import { findRouteKey } from "@/i18n/paths";

import type { RouteMatcher } from "../types";

export const matchCmsRoutes: RouteMatcher = async (ctx) => {
  const { locale, slug } = ctx;
  const routeKey = findRouteKey(slug, locale);

  const page = await getPageContent(slug, locale);
  if (page) {
    return { kind: "cms-page", page, routeKey, ...ctx };
  }

  if (routeKey && isPageHeroRouteKey(routeKey)) {
    return { kind: "page-hero-placeholder", routeKey, ...ctx };
  }

  return { kind: "under-construction", ...ctx };
};
