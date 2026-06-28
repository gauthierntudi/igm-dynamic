import { mediaUrl } from "@/lib/cdnUrl";
import { withDeployedBase } from "@/lib/deployBasePath";

import type { CmsMedia } from "./types";

export function tryResolveHeroMediaSrc(
  media: CmsMedia | number | null | undefined,
): string | null {
  if (!media || typeof media !== "object") return null;

  const url = mediaUrl(media);
  if (!url) return null;

  if (/^https?:\/\//i.test(url)) return url;

  const normalized = url.startsWith("/") ? url : `/${url}`;
  return withDeployedBase(normalized);
}

/** Vignette poster d’une vidéo (sizes.poster + prefix du fichier parent). */
export function tryResolveVideoPosterSrc(
  media: CmsMedia | null | undefined,
): string | null {
  if (!media || typeof media !== "object") return null;

  const parentPrefix = media.prefix ?? null;
  const poster = media.sizes?.poster;

  if (poster && (poster.filename || poster.url)) {
    const resolved = tryResolveHeroMediaSrc({
      filename: poster.filename ?? null,
      url: poster.url ?? null,
      prefix: poster.prefix ?? parentPrefix,
    });
    if (resolved) return resolved;
  }

  if (media.thumbnailURL) {
    const resolved = tryResolveHeroMediaSrc({
      url: media.thumbnailURL,
      prefix: parentPrefix,
    });
    if (resolved) return resolved;
  }

  return null;
}

export function resolveHeroMediaSrc(
  media: CmsMedia | number | null | undefined,
  fallback: string,
): string {
  return tryResolveHeroMediaSrc(media) ?? withDeployedBase(fallback);
}
