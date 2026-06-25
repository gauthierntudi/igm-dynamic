import { mediaUrl } from "@/lib/cdnUrl";
import type { CmsMedia } from "@/lib/cms/types";

const FALLBACK_COVERS = [
  "/assets/img/img-06.jpg",
  "/assets/img/01.jpg",
  "/assets/img/02.jpg",
  "/assets/img/banner-img.jpg",
] as const;

export function resolveNewsCoverSrc(
  cover: CmsMedia | string | number | null | undefined,
  index = 0,
): string {
  if (cover && typeof cover === "object") {
    const url = mediaUrl(cover);
    if (url) return url;
  }

  return FALLBACK_COVERS[index % FALLBACK_COVERS.length];
}
