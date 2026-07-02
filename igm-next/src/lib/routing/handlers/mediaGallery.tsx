import type { Metadata } from "next";

import { VideoGalleryPageView } from "@/components/media-gallery/VideoGalleryPageView";
import { getMediaGalleryVideos } from "@/lib/cms/media-gallery/getMediaGalleryItems";
import { resolveMediaGalleryItems } from "@/lib/cms/media-gallery/resolveMediaGalleryItem";
import { getPageHeroesSettings } from "@/lib/cms/page-heroes/getPageHeroesSettings";
import { resolvePageHeroImage } from "@/lib/cms/page-heroes/resolvePageHero";
import { getMessages } from "@/i18n/messages";

import { siteMeta } from "../siteMeta";
import type { SiteRoute } from "../types";

type VideosRoute = Extract<SiteRoute, { kind: "videos" }>;

export async function renderVideosRoute(route: VideosRoute) {
  const { locale } = route;
  const [items, pageHeroes] = await Promise.all([
    getMediaGalleryVideos(locale),
    getPageHeroesSettings(locale),
  ]);
  const heroImageSrc = resolvePageHeroImage(pageHeroes, "videos");
  const resolvedItems = resolveMediaGalleryItems(items);
  return (
    <VideoGalleryPageView locale={locale} items={resolvedItems} heroImageSrc={heroImageSrc} />
  );
}

export async function buildVideosMetadata(route: VideosRoute): Promise<Metadata> {
  const { locale, pathSegments } = route;
  const meta = getMessages(locale).mediaGalleryPage.categories.videos;
  return siteMeta(locale, pathSegments, {
    title: meta.metaTitle,
    description: meta.metaDescription,
  });
}
