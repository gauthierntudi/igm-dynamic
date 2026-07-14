/** Vidéo médiathèque (une entrée = une vidéo YouTube). */
export type CmsMediaGalleryItem = {
  id: number;
  title: string;
  summary?: string | null;
  caption?: string | null;
  publishedAt?: string | null;
  order?: number | null;
  youtubeUrl?: string | null;
};

export type ResolvedMediaGalleryItem = {
  id: number;
  title: string;
  summary?: string | null;
  caption?: string | null;
  publishedAt?: string | null;
  youtubeId: string;
  embedSrc: string;
  posterSrc: string;
  alt: string;
  isVideo: true;
};
