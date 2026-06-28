import { tryResolveHeroMediaSrc } from "../resolveHeroMediaSrc";
import type { CmsMedia } from "../types";
import type {
  CmsPhotoAlbum,
  ResolvedAlbumPhoto,
  ResolvedPhotoAlbumDetail,
  ResolvedPhotoAlbumSummary,
} from "./types";

function resolveAlbumPhoto(media: CmsMedia, index: number): ResolvedAlbumPhoto | null {
  const mediaSrc = tryResolveHeroMediaSrc(media);
  if (!mediaSrc) return null;
  return {
    id: media.id ?? index,
    mediaSrc,
    alt: media.alt?.trim() || "Photo IGM",
  };
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
  const photos = (album.photos ?? [])
    .filter((item): item is CmsMedia => item != null && typeof item === "object")
    .map((media, index) => resolveAlbumPhoto(media, index))
    .filter((item): item is ResolvedAlbumPhoto => item != null);

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

  const photos = (album.photos ?? [])
    .filter((item): item is CmsMedia => item != null && typeof item === "object")
    .map((media, index) => resolveAlbumPhoto(media, index))
    .filter((item): item is ResolvedAlbumPhoto => item != null);

  return {
    ...summary,
    photos,
  };
}

export function resolvePhotoAlbumSummaries(albums: CmsPhotoAlbum[]): ResolvedPhotoAlbumSummary[] {
  return albums
    .map(resolvePhotoAlbumSummary)
    .filter((album): album is ResolvedPhotoAlbumSummary => album != null);
}
