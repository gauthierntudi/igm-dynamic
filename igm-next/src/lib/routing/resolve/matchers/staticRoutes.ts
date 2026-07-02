import { findRouteKey } from "@/i18n/paths";
import { parseLegislationCategory } from "@/lib/legislation/parseLegislationCategory";

import type { RouteMatcher } from "../types";

export const matchStaticRoutes: RouteMatcher = (ctx) => {
  const { locale, slug } = ctx;
  const routeKey = findRouteKey(slug, locale);

  if (routeKey === "report") {
    return { kind: "report", ...ctx };
  }

  if (routeKey === "map") {
    return { kind: "map", ...ctx };
  }

  if (routeKey === "contact") {
    return { kind: "contact", ...ctx };
  }

  const legislationCategory = parseLegislationCategory(slug, locale);
  if (legislationCategory) {
    return { kind: "legislation", category: legislationCategory, ...ctx };
  }

  if (routeKey === "videos") {
    return { kind: "videos", ...ctx };
  }

  if (routeKey === "orgChart") {
    return { kind: "org-chart", ...ctx };
  }

  return null;
};
