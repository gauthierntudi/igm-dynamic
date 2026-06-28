/** Vidéos médiathèque (une vidéo = un élément). Les photos sont dans « Albums photos ». */
export const MEDIA_GALLERY_CATEGORIES = ["videos"] as const;

export type MediaGalleryCategory = (typeof MEDIA_GALLERY_CATEGORIES)[number];

export function isMediaGalleryCategory(value: string): value is MediaGalleryCategory {
  return (MEDIA_GALLERY_CATEGORIES as readonly string[]).includes(value);
}

export const MEDIA_GALLERY_CATEGORY_LABELS: Record<
  MediaGalleryCategory,
  { fr: string; en: string }
> = {
  videos: { fr: "Vidéos", en: "Videos" },
};
