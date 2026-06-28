import type { CmsMedia } from "../types";

export type CmsPhotoAlbum = {
  id: number;
  title: string;
  slug: string;
  summary?: string | null;
  coverImage?: CmsMedia | number | null;
  photos?: (CmsMedia | number)[] | null;
  publishedAt?: string | null;
  order?: number | null;
};

export type ResolvedPhotoAlbumSummary = {
  id: number;
  title: string;
  slug: string;
  summary?: string | null;
  coverSrc: string | null;
  photoCount: number;
  publishedAt?: string | null;
};

export type ResolvedAlbumPhoto = {
  id: string | number;
  mediaSrc: string;
  alt: string;
};

export type ResolvedPhotoAlbumDetail = ResolvedPhotoAlbumSummary & {
  photos: ResolvedAlbumPhoto[];
};
