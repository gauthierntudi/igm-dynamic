import type { Metadata } from "next";

import { getHome } from "@/lib/cms/client";
import { renderHomePage } from "@/lib/cms/home/renderHomePage";
import { tryResolveHeroMediaSrc } from "@/lib/cms/resolveHeroMediaSrc";

import { siteMeta } from "../siteMeta";
import type { SiteRoute } from "../types";

type HomeRoute = Extract<SiteRoute, { kind: "home" }>;

export async function renderHomeRoute(route: HomeRoute) {
  return renderHomePage(route.locale);
}

export async function buildHomeMetadata(route: HomeRoute): Promise<Metadata> {
  const { locale, pathSegments } = route;
  const home = await getHome(locale);
  const firstBannerImage = home?.bannerSlides?.find(
    (slide) => slide.image && typeof slide.image === "object",
  )?.image;

  return siteMeta(locale, pathSegments, {
    title: home?.seoTitle?.trim() || "IGM — Inspection Générale des Mines",
    description: home?.seoDescription?.trim(),
    image: tryResolveHeroMediaSrc(firstBannerImage),
  });
}
