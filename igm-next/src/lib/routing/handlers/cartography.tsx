import type { Metadata } from "next";

import { CartographyPageView } from "@/components/cartography/CartographyPageView";
import { getCartographySettings } from "@/lib/cms/cartography/getCartographySettings";
import { getPageHeroesSettings } from "@/lib/cms/page-heroes/getPageHeroesSettings";
import { resolvePageHeroImage } from "@/lib/cms/page-heroes/resolvePageHero";
import { getMessages } from "@/i18n/messages";

import { siteMeta } from "../siteMeta";
import type { SiteRoute } from "../types";

type MapRoute = Extract<SiteRoute, { kind: "map" }>;

export async function renderMapRoute(route: MapRoute) {
  const [pageHeroes, cartographySettings] = await Promise.all([
    getPageHeroesSettings(route.locale),
    getCartographySettings(route.locale),
  ]);
  const heroImageSrc = resolvePageHeroImage(pageHeroes, "map");
  return (
    <CartographyPageView
      locale={route.locale}
      heroImageSrc={heroImageSrc}
      cartographySettings={cartographySettings}
    />
  );
}

export async function buildMapMetadata(route: MapRoute): Promise<Metadata> {
  const { locale, pathSegments } = route;
  const m = getMessages(locale).cartography;
  return siteMeta(locale, pathSegments, {
    title: m.metaTitle,
    description: m.metaDescription,
  });
}
