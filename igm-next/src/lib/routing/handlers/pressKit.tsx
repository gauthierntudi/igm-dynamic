import type { Metadata } from "next";

import { PressKitPageView } from "@/components/press-kit/PressKitPageView";
import { getPressKitSettings } from "@/lib/cms/press-kit/getPressKitSettings";
import { resolvePressKitPage } from "@/lib/cms/press-kit/resolvePressKitPage";
import { getPageHeroesSettings } from "@/lib/cms/page-heroes/getPageHeroesSettings";
import { resolvePageHeroImage } from "@/lib/cms/page-heroes/resolvePageHero";

import { siteMeta } from "../siteMeta";
import type { SiteRoute } from "../types";

type PressKitRoute = Extract<SiteRoute, { kind: "press-kit" }>;

export async function renderPressKitRoute(route: PressKitRoute) {
  const { locale } = route;
  const [pageHeroes, pressKitCms] = await Promise.all([
    getPageHeroesSettings(locale),
    getPressKitSettings(locale),
  ]);
  const heroImageSrc = resolvePageHeroImage(pageHeroes, "pressKit");
  const content = resolvePressKitPage(pressKitCms, locale);

  return (
    <PressKitPageView locale={locale} heroImageSrc={heroImageSrc} content={content} />
  );
}

export async function buildPressKitMetadata(route: PressKitRoute): Promise<Metadata> {
  const { locale, pathSegments } = route;
  const pressKitCms = await getPressKitSettings(locale);
  const content = resolvePressKitPage(pressKitCms, locale);
  return siteMeta(locale, pathSegments, {
    title: content.seoTitle,
    description: content.seoDescription,
  });
}
