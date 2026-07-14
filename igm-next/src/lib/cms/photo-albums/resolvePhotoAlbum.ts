import { tryResolveHeroMediaSrc } from "../resolveHeroMediaSrc";
import type { CmsMedia } from "../types";
import type {
  CmsPhotoAlbum,
  CmsPhotoAlbumPhoto,
  ResolvedAlbumPhoto,
  ResolvedPhotoAlbumDetail,
  ResolvedPhotoAlbumSummary,
} from "./types";

function isPhotoRow(value: unknown): value is CmsPhotoAlbumPhoto {
  return Boolean(value && typeof value === "object" && "image" in value);
}

function resolveAlbumPhoto(
  media: CmsMedia,
  index: number,
  caption?: string | null,
  rowId?: string | null,
): ResolvedAlbumPhoto | null {
  const mediaSrc = tryResolveHeroMediaSrc(media);
  if (!mediaSrc) return null;
  return {
    id: rowId?.trim() || media.id || index,
    mediaSrc,
    alt: media.alt?.trim() || "Photo IGM",
    caption: caption?.trim() || null,
  };
}

function resolveAlbumPhotos(album: CmsPhotoAlbum): ResolvedAlbumPhoto[] {
  const photos: ResolvedAlbumPhoto[] = [];

  for (const [index, entry] of (album.photos ?? []).entries()) {
    if (entry == null) continue;

    if (typeof entry === "number") continue;

    if (isPhotoRow(entry)) {
      const media = entry.image;
      if (!media || typeof media !== "object") continue;
      const resolved = resolveAlbumPhoto(media, index, entry.caption, entry.id);
      if (resolved) photos.push(resolved);
      continue;
    }

    if (typeof entry === "object") {
      const resolved = resolveAlbumPhoto(entry as CmsMedia, index);
      if (resolved) photos.push(resolved);
    }
  }

  return photos;
}

function resolveCoverSrc(
  album: CmsPhotoAlbum,
  photos: ResolvedAlbumPhoto[],
): string | null {
  const cover = album.coverImage;
  if (cover && typeof cover === "object") {
    const src = tryResolveHeroMediaSrc(cover);
    if (src) return src;
  }
  return photos[0]?.mediaSrc ?? null;
}

export function resolvePhotoAlbumSummary(album: CmsPhotoAlbum): ResolvedPhotoAlbumSummary | null {
  const photos = resolveAlbumPhotos(album);
  if (photos.length === 0) return null;

  return {
    id: album.id,
    title: album.title?.trim() || "Album",
    slug: album.slug?.trim() || String(album.id),
    summary: album.summary?.trim() || null,
    coverSrc: resolveCoverSrc(album, photos),
    photoCount: photos.length,
    publishedAt: album.publishedAt ?? null,
  };
}

export function resolvePhotoAlbumDetail(album: CmsPhotoAlbum): ResolvedPhotoAlbumDetail | null {
  const summary = resolvePhotoAlbumSummary(album);
  if (!summary) return null;

  return {
    ...summary,
    photos: resolveAlbumPhotos(album),
  };
}

export function resolvePhotoAlbumSummaries(albums: CmsPhotoAlbum[]): ResolvedPhotoAlbumSummary[] {
  return albums
    .map(resolvePhotoAlbumSummary)
    .filter((album): album is ResolvedPhotoAlbumSummary => album != null);
}
