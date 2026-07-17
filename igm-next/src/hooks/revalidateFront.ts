import { revalidatePath, revalidateTag } from "next/cache";
import type { CollectionAfterChangeHook, GlobalAfterChangeHook } from "payload";

import { localePathPrefix, SUPPORTED_LOCALES } from "@/i18n/locales";
import { hrefForRoute, hrefForNewsArticle, hrefForPhotoAlbum, hrefForPressReviewArticle } from "@/i18n/paths";
import { LEGISLATION_CATEGORIES } from "@/lib/legislation/constants";
import { pageHeroRouteKeysForRevalidation } from "@/lib/page-heroes/constants";

function revalidateSite(tags: string[]) {
  try {
    for (const tag of tags) {
      // expire: 0 → invalidation immédiate (évite de servir un contentHtml obsolète sans <ul>)
      revalidateTag(tag, { expire: 0 });
    }
    revalidatePath("/");
    for (const locale of SUPPORTED_LOCALES) {
      revalidatePath(localePathPrefix(locale) || "/");
    }
  } catch {
    // Hors contexte Next.js (scripts CLI, migrations).
  }
}

function revalidateLegislationPages() {
  for (const category of LEGISLATION_CATEGORIES) {
    revalidatePath(hrefForRoute(category, "fr"));
    revalidatePath(hrefForRoute(category, "en"));
  }
}

function revalidatePagePaths(slug: string) {
  try {
    revalidatePath(`/${slug}`);
    if (slug === "home") {
      revalidatePath("/");
    }

    for (const locale of SUPPORTED_LOCALES) {
      const prefix = localePathPrefix(locale);
      const localizedPath = prefix ? `${prefix}/${slug}` : `/${slug}`;
      revalidatePath(localizedPath);
      if (slug === "home" && prefix) {
        revalidatePath(prefix);
      }
    }
  } catch {
    // Hors contexte Next.js (scripts CLI, migrations).
  }
}

export const revalidateFrontCollection: CollectionAfterChangeHook = ({ collection, doc }) => {
  const tags = [`collection:${collection.slug}`, `doc:${collection.slug}:${doc.id}`];

  for (const locale of SUPPORTED_LOCALES) {
    tags.push(`collection:${collection.slug}:${locale}`);
  }

  if (collection.slug === "pages" && typeof doc.slug === "string" && doc.slug.length > 0) {
    tags.push(`page:slug:${doc.slug}`);
    for (const locale of SUPPORTED_LOCALES) {
      tags.push(`page:slug:${doc.slug}:${locale}`);
    }
    revalidatePagePaths(doc.slug);
  }

  if (collection.slug === "legislation-documents") {
    try {
      revalidateLegislationPages();
    } catch {
      // Hors contexte Next.js.
    }
  }

  if (collection.slug === "media-gallery-items") {
    try {
      revalidatePath(hrefForRoute("videos", "fr"));
      revalidatePath(hrefForRoute("videos", "en"));
    } catch {
      // Hors contexte Next.js.
    }
  }

  if (collection.slug === "news") {
    try {
      revalidatePath(hrefForRoute("news", "fr"));
      revalidatePath(hrefForRoute("news", "en"));
      revalidatePath(hrefForRoute("pressReview", "fr"));
      revalidatePath(hrefForRoute("pressReview", "en"));
      if (typeof doc.slug === "string" && doc.slug.length > 0) {
        revalidatePath(hrefForNewsArticle(doc.slug, "fr"));
        revalidatePath(hrefForNewsArticle(doc.slug, "en"));
        revalidatePath(hrefForPressReviewArticle(doc.slug, "fr"));
        revalidatePath(hrefForPressReviewArticle(doc.slug, "en"));
      }
    } catch {
      // Hors contexte Next.js.
    }
  }

  if (collection.slug === "photo-albums") {
    try {
      revalidatePath(hrefForRoute("photos", "fr"));
      revalidatePath(hrefForRoute("photos", "en"));
      if (typeof doc.slug === "string" && doc.slug.length > 0) {
        revalidatePath(hrefForPhotoAlbum(doc.slug, "fr"));
        revalidatePath(hrefForPhotoAlbum(doc.slug, "en"));
      }
    } catch {
      // Hors contexte Next.js.
    }
  }

  if (collection.slug === "media") {
    for (const globalSlug of ["page-heroes", "who-we-are", "legislation", "home", "cartography-settings"]) {
      tags.push(`global:${globalSlug}`);
      for (const locale of SUPPORTED_LOCALES) {
        tags.push(`global:${globalSlug}:${locale}`);
      }
    }

    try {
      for (const routeKey of pageHeroRouteKeysForRevalidation()) {
        revalidatePath(hrefForRoute(routeKey, "fr"));
        revalidatePath(hrefForRoute(routeKey, "en"));
      }
      revalidatePath("/a-propos");
      revalidatePath("/historique");
      revalidatePath("/mission");
      revalidatePath("/en/about");
      revalidatePath("/en/history");
      revalidatePath("/en/mission");
      revalidateLegislationPages();
      revalidatePath(hrefForRoute("photos", "fr"));
      revalidatePath(hrefForRoute("photos", "en"));
      revalidatePath(hrefForRoute("videos", "fr"));
      revalidatePath(hrefForRoute("videos", "en"));
      revalidatePath(hrefForRoute("pressKit", "fr"));
      revalidatePath(hrefForRoute("pressKit", "en"));
      revalidatePath("/");
      for (const locale of SUPPORTED_LOCALES) {
        revalidatePath(localePathPrefix(locale) || "/");
      }
    } catch {
      // Hors contexte Next.js.
    }
  }

  revalidateSite(tags);
  return doc;
};

export const revalidateFrontGlobal: GlobalAfterChangeHook = ({ global, doc }) => {
  const tags = [`global:${global.slug}`];
  for (const locale of SUPPORTED_LOCALES) {
    tags.push(`global:${global.slug}:${locale}`);
  }

  if (global.slug === "who-we-are") {
    try {
      revalidatePath("/a-propos");
      revalidatePath("/historique");
      revalidatePath("/mission");
      revalidatePath("/en/about");
      revalidatePath("/en/history");
      revalidatePath("/en/mission");
    } catch {
      // Hors contexte Next.js.
    }
  }

  if (global.slug === "legislation") {
    try {
      revalidateLegislationPages();
    } catch {
      // Hors contexte Next.js.
    }
  }

  if (global.slug === "page-heroes") {
    try {
      for (const routeKey of pageHeroRouteKeysForRevalidation()) {
        revalidatePath(hrefForRoute(routeKey, "fr"));
        revalidatePath(hrefForRoute(routeKey, "en"));
      }
    } catch {
      // Hors contexte Next.js.
    }
  }

  if (global.slug === "contact-page") {
    try {
      revalidatePath(hrefForRoute("contact", "fr"));
      revalidatePath(hrefForRoute("contact", "en"));
    } catch {
      // Hors contexte Next.js.
    }
  }

  if (global.slug === "press-kit-page") {
    try {
      revalidatePath(hrefForRoute("pressKit", "fr"));
      revalidatePath(hrefForRoute("pressKit", "en"));
    } catch {
      // Hors contexte Next.js.
    }
  }

  if (String(global.slug) === "cartography-settings") {
    try {
      revalidatePath(hrefForRoute("map", "fr"));
      revalidatePath(hrefForRoute("map", "en"));
    } catch {
      // Hors contexte Next.js.
    }
  }

  revalidateSite(tags);
  return doc;
};
