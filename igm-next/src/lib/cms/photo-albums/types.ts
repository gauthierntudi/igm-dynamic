import type { CmsMedia } from "../types";

export type CmsPhotoAlbumPhoto = {
  id?: string | null;
  image?: CmsMedia | number | null;
  caption?: string | null;
};

export type CmsPhotoAlbum = {
  id: number;
  title: string;
  slug: string;
  summary?: string | null;
  coverImage?: CmsMedia | number | null;
  /** Nouveau format (array) ou ancien format (hasMany media). */
  photos?: (CmsPhotoAlbumPhoto | CmsMedia | number)[] | null;
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
  caption?: string | null;
};

export type ResolvedPhotoAlbumDetail = ResolvedPhotoAlbumSummary & {
  photos: ResolvedAlbumPhoto[];
};
