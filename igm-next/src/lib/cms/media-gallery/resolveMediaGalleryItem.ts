import { tryResolveHeroMediaSrc, tryResolveVideoPosterSrc } from "../resolveHeroMediaSrc";
import type { CmsMediaGalleryItem, ResolvedMediaGalleryItem } from "./types";

export function resolveMediaGalleryItem(
  item: CmsMediaGalleryItem,
): ResolvedMediaGalleryItem | null {
  const media = item.media;
  if (!media || typeof media !== "object") return null;

  const mediaSrc = tryResolveHeroMediaSrc(media);
  if (!mediaSrc) return null;

  const isVideo = Boolean(media.mimeType?.startsWith("video/"));
  const posterSrc = isVideo ? tryResolveVideoPosterSrc(media) : mediaSrc;

  return {
    id: item.id,
    title: item.title?.trim() || media.alt?.trim() || "Média",
    summary: item.summary?.trim() || null,
    caption: item.caption?.trim() || null,
    publishedAt: item.publishedAt ?? null,
    mediaSrc,
    posterSrc,
    alt: media.alt?.trim() || item.title?.trim() || "Média IGM",
    isVideo,
  };
}

export function resolveMediaGalleryItems(
  items: CmsMediaGalleryItem[],
): ResolvedMediaGalleryItem[] {
  return items
    .map(resolveMediaGalleryItem)
    .filter((item): item is ResolvedMediaGalleryItem => item != null);
}
