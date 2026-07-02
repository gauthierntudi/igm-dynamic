import { isPhotosListingPath, parsePhotoAlbumSlug } from "@/i18n/paths";

import type { RouteMatcher } from "../types";

export const matchPhotoRoutes: RouteMatcher = (ctx) => {
  const { locale, pathSegments } = ctx;

  const photoAlbumSlug = parsePhotoAlbumSlug(pathSegments, locale);
  if (photoAlbumSlug) {
    return { kind: "photo-album", albumSlug: photoAlbumSlug, ...ctx };
  }

  if (isPhotosListingPath(pathSegments, locale)) {
    return { kind: "photos-listing", ...ctx };
  }

  return null;
};
