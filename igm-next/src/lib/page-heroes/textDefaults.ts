import type { SupportedLocale } from "@/i18n/locales";
import { getMessages } from "@/i18n/messages";

import type { PageHeroRouteKey } from "./constants";

/** Pages dont le titre/sous-titre de bannière se configure dans « Bannières de pages ». */
export const PAGE_HERO_TEXT_ROUTE_KEYS = [
  "orgChart",
  "map",
  "strategy",
  "fraud",
  "smuggling",
  "sanctions",
  "report",
  "photos",
  "videos",
] as const;

export type PageHeroTextRouteKey = (typeof PAGE_HERO_TEXT_ROUTE_KEYS)[number];

export function isPageHeroTextRouteKey(
  routeKey: PageHeroRouteKey,
): routeKey is PageHeroTextRouteKey {
  return (PAGE_HERO_TEXT_ROUTE_KEYS as readonly string[]).includes(routeKey);
}

export const PAGE_HERO_TITLE_FIELD: Record<
  PageHeroTextRouteKey,
  `${PageHeroTextRouteKey}HeroTitle`
> = {
  orgChart: "orgChartHeroTitle",
  map: "mapHeroTitle",
  strategy: "strategyHeroTitle",
  fraud: "fraudHeroTitle",
  smuggling: "smugglingHeroTitle",
  sanctions: "sanctionsHeroTitle",
  report: "reportHeroTitle",
  photos: "photosHeroTitle",
  videos: "videosHeroTitle",
};

export const PAGE_HERO_SUBTITLE_FIELD: Record<
  PageHeroTextRouteKey,
  `${PageHeroTextRouteKey}HeroSubtitle`
> = {
  orgChart: "orgChartHeroSubtitle",
  map: "mapHeroSubtitle",
  strategy: "strategyHeroSubtitle",
  fraud: "fraudHeroSubtitle",
  smuggling: "smugglingHeroSubtitle",
  sanctions: "sanctionsHeroSubtitle",
  report: "reportHeroSubtitle",
  photos: "photosHeroSubtitle",
  videos: "videosHeroSubtitle",
};

export function getDefaultPageHeroTitle(
  routeKey: PageHeroTextRouteKey,
  locale: SupportedLocale,
): string {
  const messages = getMessages(locale);

  switch (routeKey) {
    case "orgChart":
      return messages.nav.orgChart;
    case "map":
      return messages.cartography.title;
    case "strategy":
      return messages.nav.strategy;
    case "fraud":
      return messages.nav.miningFraud;
    case "smuggling":
      return messages.nav.miningSmuggling;
    case "sanctions":
      return messages.nav.sanctions;
    case "report":
      return messages.nav.report;
    case "photos":
      return messages.mediaGalleryPage.categories.photos.title;
    case "videos":
      return messages.mediaGalleryPage.categories.videos.title;
  }
}

export function getDefaultPageHeroSubtitle(
  routeKey: PageHeroTextRouteKey,
  locale: SupportedLocale,
): string {
  const messages = getMessages(locale);

  switch (routeKey) {
    case "orgChart":
      return locale === "en"
        ? "Structure of the General Inspectorate of Mines under Decree No. 23/19."
        : "Structure de l'Inspection Générale des Mines conformément au Décret n°23/19.";
    case "map":
      return messages.cartography.subtitle;
    case "strategy":
      return locale === "en"
        ? "National roadmap for strengthening mining governance and sector transparency."
        : "Feuille de route nationale pour renforcer la gouvernance minière et la transparence du secteur.";
    case "fraud":
    case "smuggling":
    case "sanctions":
    case "report":
      return messages.underConstruction.lead;
    case "photos":
      return messages.mediaGalleryPage.categories.photos.lead;
    case "videos":
      return messages.mediaGalleryPage.categories.videos.lead;
  }
}
