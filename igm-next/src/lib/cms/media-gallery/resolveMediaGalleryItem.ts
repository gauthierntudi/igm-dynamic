import {
  parseYoutubeVideoId,
  youtubeEmbedSrc,
  youtubePosterSrc,
} from "./parseYoutubeUrl";
import type { CmsMediaGalleryItem, ResolvedMediaGalleryItem } from "./types";

export function resolveMediaGalleryItem(
  item: CmsMediaGalleryItem,
): ResolvedMediaGalleryItem | null {
  const youtubeId = parseYoutubeVideoId(item.youtubeUrl);
  if (!youtubeId) return null;

  const title = item.title?.trim() || "Vidéo";

  return {
    id: item.id,
    title,
    summary: item.summary?.trim() || null,
    caption: item.caption?.trim() || null,
    publishedAt: item.publishedAt ?? null,
    youtubeId,
    embedSrc: youtubeEmbedSrc(youtubeId, { autoplay: true }),
    posterSrc: youtubePosterSrc(youtubeId),
    alt: title,
    isVideo: true,
  };
}

export function resolveMediaGalleryItems(
  items: CmsMediaGalleryItem[],
): ResolvedMediaGalleryItem[] {
  return items
    .map(resolveMediaGalleryItem)
    .filter((item): item is ResolvedMediaGalleryItem => item != null);
}
