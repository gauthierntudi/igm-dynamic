import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PhotoAlbumPageView } from "@/components/media-gallery/PhotoAlbumPageView";
import { PhotoAlbumsPageView } from "@/components/media-gallery/PhotoAlbumsPageView";
import { getContactPageSettings } from "@/lib/cms/contact/getContactPageSettings";
import { resolveContactPage } from "@/lib/cms/contact/resolveContactPage";
import { getHome } from "@/lib/cms/client";
import { getPageContent } from "@/lib/cms/getPageContent";
import { getLegislationSettings } from "@/lib/cms/legislation/getLegislationSettings";
import { getPageHeroesSettings } from "@/lib/cms/page-heroes/getPageHeroesSettings";
import { resolvePageHeroBanner } from "@/lib/cms/page-heroes/resolvePageHeroText";
import { resolvePageHeroImage } from "@/lib/cms/page-heroes/resolvePageHero";
import { getPhotoAlbumBySlug, getPhotoAlbums } from "@/lib/cms/photo-albums/getPhotoAlbums";
import {
  resolvePhotoAlbumDetail,
  resolvePhotoAlbumSummaries,
} from "@/lib/cms/photo-albums/resolvePhotoAlbum";
import { tryResolveHeroMediaSrc } from "@/lib/cms/resolveHeroMediaSrc";
import { parseLegislationCategory } from "@/lib/legislation/parseLegislationCategory";
import { getMessages } from "@/i18n/messages";
import { findRouteKey, isPhotosListingPath } from "@/i18n/paths";

import { cmsMediaForOg, siteMeta } from "../siteMeta";
import type { RouteContext, SiteRoute } from "../types";

type PhotoAlbumRoute = Extract<SiteRoute, { kind: "photo-album" }>;
type PhotosListingRoute = Extract<SiteRoute, { kind: "photos-listing" }>;

export async function renderPhotoAlbumRoute(route: PhotoAlbumRoute) {
  const { locale, albumSlug } = route;
  const [album, pageHeroes] = await Promise.all([
    getPhotoAlbumBySlug(albumSlug, locale),
    getPageHeroesSettings(locale),
  ]);
  const resolved = album ? resolvePhotoAlbumDetail(album) : null;
  if (!resolved) notFound();

  const heroImageSrc = resolved.coverSrc ?? resolvePageHeroImage(pageHeroes, "photos");
  const photosHeroTitle = resolvePageHeroBanner(pageHeroes, "photos", locale).title;
  return (
    <PhotoAlbumPageView
      locale={locale}
      album={resolved}
      heroImageSrc={heroImageSrc}
      photosHeroTitle={photosHeroTitle}
    />
  );
}

export async function renderPhotosListingRoute(route: PhotosListingRoute) {
  const { locale } = route;
  const [albums, pageHeroes] = await Promise.all([
    getPhotoAlbums(locale),
    getPageHeroesSettings(locale),
  ]);
  const heroImageSrc = resolvePageHeroImage(pageHeroes, "photos");
  const heroBanner = resolvePageHeroBanner(pageHeroes, "photos", locale);
  return (
    <PhotoAlbumsPageView
      locale={locale}
      albums={resolvePhotoAlbumSummaries(albums)}
      heroImageSrc={heroImageSrc}
      heroTitle={heroBanner.title}
      heroSubtitle={heroBanner.subtitle}
    />
  );
}

/** Metadata fall-through when a photo album slug does not match a published album. */
export async function buildMetadataAfterPhotoAlbum(ctx: RouteContext): Promise<Metadata> {
  const { locale, pathSegments, slug } = ctx;

  if (isPhotosListingPath(pathSegments, locale)) {
    const meta = getMessages(locale).mediaGalleryPage.categories.photos;
    return siteMeta(locale, pathSegments, {
      title: meta.metaTitle,
      description: meta.metaDescription,
    });
  }

  const page = await getPageContent(slug, locale);
  if (page) {
    return siteMeta(locale, pathSegments, {
      title: page.seoTitle?.trim() || `${page.title} — IGM`,
      description: page.seoDescription?.trim() || page.summary?.trim(),
      image: tryResolveHeroMediaSrc(cmsMediaForOg(page.hero?.media)),
      imageAlt: page.title,
    });
  }

  if (findRouteKey(slug, locale) === "report") {
    const m = getMessages(locale).denoncer;
    return siteMeta(locale, pathSegments, {
      title: m.metaTitle,
      description: m.metaDescription,
    });
  }

  if (findRouteKey(slug, locale) === "map") {
    const m = getMessages(locale).cartography;
    return siteMeta(locale, pathSegments, {
      title: m.metaTitle,
      description: m.metaDescription,
    });
  }

  if (findRouteKey(slug, locale) === "contact") {
    const contactCms = await getContactPageSettings(locale);
    const content = resolveContactPage(contactCms, locale);
    return siteMeta(locale, pathSegments, {
      title: content.seoTitle,
      description: content.seoDescription,
    });
  }

  const legislationCategory = parseLegislationCategory(slug, locale);
  if (legislationCategory) {
    const meta = getMessages(locale).legislationPage.categories[legislationCategory];
    const legislationSettings = await getLegislationSettings(locale);
    const heroField = {
      ordinances: "ordinancesHeroImage",
      laws: "lawsHeroImage",
      decrees: "decreesHeroImage",
      decisions: "decisionsHeroImage",
    } as const;
    const heroMedia = legislationSettings?.[heroField[legislationCategory]];
    return siteMeta(locale, pathSegments, {
      title: meta.metaTitle,
      description: meta.metaDescription,
      image: tryResolveHeroMediaSrc(
        heroMedia && typeof heroMedia === "object" ? heroMedia : null,
      ),
    });
  }

  if (findRouteKey(slug, locale) === "videos") {
    const meta = getMessages(locale).mediaGalleryPage.categories.videos;
    return siteMeta(locale, pathSegments, {
      title: meta.metaTitle,
      description: meta.metaDescription,
    });
  }

  if (findRouteKey(slug, locale) === "orgChart") {
    const home = await getHome(locale);
    const title = `${getMessages(locale).nav.orgChart} — IGM`;
    const description =
      home?.orgChartSection?.lead?.trim() ||
      (locale === "en"
        ? "Organizational chart of the General Inspectorate of Mines in the DRC."
        : "Organigramme de l'Inspection Générale des Mines en RDC.");
    return siteMeta(locale, pathSegments, { title, description });
  }

  return siteMeta(locale, pathSegments, {
    title: getMessages(locale).underConstruction.metaTitle,
  });
}

export async function buildPhotoAlbumMetadata(route: PhotoAlbumRoute): Promise<Metadata> {
  const { locale, pathSegments, albumSlug } = route;
  const album = await getPhotoAlbumBySlug(albumSlug, locale);
  if (album) {
    return siteMeta(locale, pathSegments, {
      title: `${album.title} — IGM`,
      description: album.summary?.trim(),
      image: tryResolveHeroMediaSrc(cmsMediaForOg(album.coverImage)),
      imageAlt: album.title,
    });
  }
  return buildMetadataAfterPhotoAlbum(route);
}

export async function buildPhotosListingMetadata(route: PhotosListingRoute): Promise<Metadata> {
  const { locale, pathSegments } = route;
  const meta = getMessages(locale).mediaGalleryPage.categories.photos;
  return siteMeta(locale, pathSegments, {
    title: meta.metaTitle,
    description: meta.metaDescription,
  });
}
