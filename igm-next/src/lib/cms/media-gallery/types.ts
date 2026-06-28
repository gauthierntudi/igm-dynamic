import type { CmsMedia } from "../types";

/** Vidéo médiathèque (une entrée = une vidéo). */
export type CmsMediaGalleryItem = {
  id: number;
  title: string;
  summary?: string | null;
  caption?: string | null;
  publishedAt?: string | null;
  order?: number | null;
  media?: CmsMedia | number | null;
};

export type ResolvedMediaGalleryItem = {
  id: number;
  title: string;
  summary?: string | null;
  caption?: string | null;
  publishedAt?: string | null;
  mediaSrc: string;
  posterSrc: string | null;
  alt: string;
  isVideo: boolean;
};
