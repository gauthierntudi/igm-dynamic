import type { RouteKey } from "@/i18n/paths";

/** Pages dont la bannière est configurable via le global « page-heroes ». */
export const PAGE_HERO_ROUTE_KEYS = [
  "orgChart",
  "map",
  "fraud",
  "smuggling",
  "sanctions",
  "report",
  "contact",
  "photos",
  "videos",
] as const;

export type PageHeroRouteKey = (typeof PAGE_HERO_ROUTE_KEYS)[number];

export function isPageHeroRouteKey(value: string): value is PageHeroRouteKey {
  return (PAGE_HERO_ROUTE_KEYS as readonly string[]).includes(value);
}

export const PAGE_HERO_FIELD: Record<PageHeroRouteKey, `${PageHeroRouteKey}HeroImage`> = {
  orgChart: "orgChartHeroImage",
  map: "mapHeroImage",
  fraud: "fraudHeroImage",
  smuggling: "smugglingHeroImage",
  sanctions: "sanctionsHeroImage",
  report: "reportHeroImage",
  contact: "contactHeroImage",
  photos: "photosHeroImage",
  videos: "videosHeroImage",
};

export const PAGE_HERO_CTA_ROUTE_KEYS = ["fraud", "smuggling", "sanctions"] as const;

export type PageHeroCtaRouteKey = (typeof PAGE_HERO_CTA_ROUTE_KEYS)[number];

export function isPageHeroCtaRouteKey(
  value: string,
): value is PageHeroCtaRouteKey {
  return (PAGE_HERO_CTA_ROUTE_KEYS as readonly string[]).includes(value);
}

export const PAGE_HERO_CTA_FIELD: Record<
  PageHeroCtaRouteKey,
  `${PageHeroCtaRouteKey}CtaHeroImage`
> = {
  fraud: "fraudCtaHeroImage",
  smuggling: "smugglingCtaHeroImage",
  sanctions: "sanctionsCtaHeroImage",
};

export const PAGE_HERO_DEFAULT: Partial<Record<PageHeroRouteKey, string>> = {
  map: "/assets/img/img-06.jpg",
};

export const PAGE_HERO_DEFAULT_FALLBACK = "/assets/img/img-07.jpg";

export const PAGE_HERO_GROUP_LABELS = {
  presentation: "Présentation (IGM)",
  lcfcm: "LCFCM",
  contact: "Contact",
  media: "Médiathèque",
} as const;

export const PAGE_HERO_GROUPS: Record<
  keyof typeof PAGE_HERO_GROUP_LABELS,
  { routeKey: PageHeroRouteKey; label: string }[]
> = {
  presentation: [
    { routeKey: "orgChart", label: "Organigramme" },
    { routeKey: "map", label: "Cartographie" },
  ],
  lcfcm: [
    { routeKey: "fraud", label: "Fraude minière" },
    { routeKey: "smuggling", label: "Contrebande minière" },
    { routeKey: "sanctions", label: "Sanctions" },
    { routeKey: "report", label: "Dénoncer" },
  ] satisfies { routeKey: PageHeroRouteKey; label: string }[],
  contact: [{ routeKey: "contact", label: "Contact" }],
  media: [
    { routeKey: "photos", label: "Photos" },
    { routeKey: "videos", label: "Vidéos" },
  ],
};

/** Routes du menu concernées (pour revalidation). */
export function pageHeroRouteKeysForRevalidation(): RouteKey[] {
  return [...PAGE_HERO_ROUTE_KEYS];
}
