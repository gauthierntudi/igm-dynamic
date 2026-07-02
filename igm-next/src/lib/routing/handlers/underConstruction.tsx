import type { Metadata } from "next";

import { UnderConstruction } from "@/components/cms/UnderConstruction";
import { getMessages } from "@/i18n/messages";

import { siteMeta } from "../siteMeta";
import type { SiteRoute } from "../types";

type UnderConstructionRoute = Extract<SiteRoute, { kind: "under-construction" }>;
type PageHeroPlaceholderRoute = Extract<SiteRoute, { kind: "page-hero-placeholder" }>;
type PlaceholderMetadataRoute = UnderConstructionRoute | PageHeroPlaceholderRoute;

export async function renderUnderConstructionRoute(route: UnderConstructionRoute) {
  return <UnderConstruction locale={route.locale} />;
}

export async function buildPlaceholderMetadata(route: PlaceholderMetadataRoute): Promise<Metadata> {
  const { locale, pathSegments } = route;
  return siteMeta(locale, pathSegments, {
    title: getMessages(locale).underConstruction.metaTitle,
  });
}
