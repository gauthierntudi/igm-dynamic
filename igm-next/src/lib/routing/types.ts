import type { RouteKey, WhoWeAreSectionId } from "@/i18n/paths";
import type { SupportedLocale } from "@/i18n/locales";
import type { CmsNews, CmsPage } from "@/lib/cms/types";
import type { LegislationCategory } from "@/lib/legislation/constants";
import type { PageHeroRouteKey } from "@/lib/page-heroes/constants";

export type RouteContext = {
  locale: SupportedLocale;
  pathSegments: string[];
  slug: string;
};

type Routed<K extends string, T extends object = object> = RouteContext & { kind: K } & T;

export type SiteRoute =
  | Routed<"home">
  | Routed<"news-article", { article: CmsNews }>
  | Routed<"news-listing", { page: number; q: string }>
  | Routed<"who-we-are-history">
  | Routed<"who-we-are-section", { section: Exclude<WhoWeAreSectionId, "history"> }>
  | Routed<"photo-album", { albumSlug: string }>
  | Routed<"photos-listing">
  | Routed<"report">
  | Routed<"map">
  | Routed<"contact">
  | Routed<"legislation", { category: LegislationCategory }>
  | Routed<"videos">
  | Routed<"org-chart">
  | Routed<"cms-page", { page: CmsPage; routeKey: RouteKey | null }>
  | Routed<"page-hero-placeholder", { routeKey: PageHeroRouteKey }>
  | Routed<"under-construction">;
