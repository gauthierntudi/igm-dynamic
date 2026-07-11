import type { Metadata } from "next";

import { CmsHistoryPageView } from "@/components/cms/CmsHistoryPageView";
import { PageHeroPlaceholderView } from "@/components/cms/PageHeroPlaceholderView";
import { tryResolveHeroMediaSrc } from "@/lib/cms/resolveHeroMediaSrc";
import { getPageHeroesSettings } from "@/lib/cms/page-heroes/getPageHeroesSettings";
import { resolvePageCtaHeroImage, resolvePageHeroImage } from "@/lib/cms/page-heroes/resolvePageHero";
import { resolvePageHeroBanner, resolvePageHeroTitle } from "@/lib/cms/page-heroes/resolvePageHeroText";
import { isPageHeroCtaRouteKey, isPageHeroRouteKey } from "@/lib/page-heroes/constants";
import { isPageHeroTextRouteKey } from "@/lib/page-heroes/textDefaults";

import { cmsMediaForOg, siteMeta } from "../siteMeta";
import type { SiteRoute } from "../types";

type CmsPageRoute = Extract<SiteRoute, { kind: "cms-page" }>;
type PageHeroPlaceholderRoute = Extract<SiteRoute, { kind: "page-hero-placeholder" }>;

export async function renderCmsPageRoute(route: CmsPageRoute) {
  const { locale, page, routeKey } = route;
  const pageHeroes =
    routeKey && isPageHeroRouteKey(routeKey) ? await getPageHeroesSettings(locale) : null;
  const heroImageSrc =
    routeKey && isPageHeroRouteKey(routeKey)
      ? resolvePageHeroImage(pageHeroes, routeKey, page)
      : undefined;
  const ctaHeroImageSrc =
    routeKey && isPageHeroCtaRouteKey(routeKey) && heroImageSrc
      ? resolvePageCtaHeroImage(pageHeroes, routeKey, page, heroImageSrc)
      : undefined;

  return (
    <CmsHistoryPageView
      page={page}
      locale={locale}
      heroImageSrc={heroImageSrc}
      ctaHeroImageSrc={ctaHeroImageSrc}
    />
  );
}

export async function renderPageHeroPlaceholderRoute(route: PageHeroPlaceholderRoute) {
  const { locale, routeKey } = route;
  const pageHeroes = await getPageHeroesSettings(locale);
  const heroImageSrc = resolvePageHeroImage(pageHeroes, routeKey);
  const heroBanner = isPageHeroTextRouteKey(routeKey)
    ? resolvePageHeroBanner(pageHeroes, routeKey, locale)
    : null;
  return (
    <PageHeroPlaceholderView
      locale={locale}
      routeKey={routeKey}
      heroImageSrc={heroImageSrc}
      heroTitle={heroBanner?.title ?? resolvePageHeroTitle(pageHeroes, routeKey, locale)}
      heroSubtitle={heroBanner?.subtitle}
    />
  );
}

export async function buildCmsPageMetadata(route: CmsPageRoute): Promise<Metadata> {
  const { locale, pathSegments, page } = route;
  return siteMeta(locale, pathSegments, {
    title: page.seoTitle?.trim() || `${page.title} — IGM`,
    description: page.seoDescription?.trim() || page.summary?.trim(),
    image: tryResolveHeroMediaSrc(cmsMediaForOg(page.hero?.media)),
    imageAlt: page.title,
  });
}
