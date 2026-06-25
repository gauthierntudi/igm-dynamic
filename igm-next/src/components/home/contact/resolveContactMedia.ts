import { mediaUrl } from "@/lib/cdnUrl";
import type { CmsMedia } from "@/lib/cms/types";
import { withDeployedBase } from "@/lib/deployBasePath";

import type { CmsHomeContactMediaItem } from "@/lib/cms/home/types";

export type ResolvedContactMediaItem =
  | { type: "image"; src: string; width: number; alt: string }
  | { type: "video"; src: string };

const VIDEO_MIME_PREFIX = "video/";

function toPublicAsset(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return withDeployedBase(normalized);
}

function resolveMediaSrc(media: CmsMedia | number | null | undefined): string | null {
  if (!media || typeof media !== "object") return null;

  const url = mediaUrl(media);
  if (!url) return null;

  if (/^https?:\/\//i.test(url)) return url;
  return toPublicAsset(url);
}

function isVideoMedia(media: CmsMedia): boolean {
  const mime = (media as CmsMedia & { mimeType?: string | null }).mimeType;
  if (mime?.startsWith(VIDEO_MIME_PREFIX)) return true;
  const name = media.filename || media.url || "";
  return /\.(mp4|webm|ogg|mov)(\?|$)/i.test(name);
}

export function resolveContactGalleryItem(
  item: CmsHomeContactMediaItem,
  fallbackWidth: number,
): ResolvedContactMediaItem | null {
  const kind = item.kind === "video" ? "video" : "image";
  const width = item.displayWidth ?? fallbackWidth;

  if (kind === "video") {
    const videoMedia =
      item.video && typeof item.video === "object"
        ? item.video
        : item.image && typeof item.image === "object"
          ? item.image
          : null;
    const src = resolveMediaSrc(videoMedia);
    return src ? { type: "video", src } : null;
  }

  const imageMedia = item.image && typeof item.image === "object" ? item.image : null;
  const src = resolveMediaSrc(imageMedia);
  if (!src) return null;

  return {
    type: "image",
    src,
    width,
    alt: item.alt?.trim() || imageMedia?.alt?.trim() || "",
  };
}

export function resolveContactGallery(
  gallery: CmsHomeContactMediaItem[] | null | undefined,
): ResolvedContactMediaItem[] {
  if (!gallery?.length) return [];

  const defaultWidths = [150, 150, 190, 190, 190, 190];

  return gallery
    .map((item, index) =>
      resolveContactGalleryItem(item, defaultWidths[index] ?? defaultWidths.at(-1) ?? 150),
    )
    .filter((item): item is ResolvedContactMediaItem => item !== null);
}

export function defaultContactGallery(): ResolvedContactMediaItem[] {
  return [
    { type: "image", src: toPublicAsset("/assets/img/img-06.jpg"), width: 150, alt: "" },
    { type: "image", src: toPublicAsset("/assets/img/slides/2.jpg"), width: 150, alt: "" },
    { type: "video", src: toPublicAsset("/assets/video/mining.mp4") },
    { type: "image", src: toPublicAsset("/assets/img/slides/1.jpg"), width: 190, alt: "" },
    { type: "image", src: toPublicAsset("/assets/img/01.jpg"), width: 190, alt: "" },
    { type: "image", src: toPublicAsset("/assets/img/slides/5.jpg"), width: 190, alt: "" },
  ];
}

/** Détecte une vidéo uploadée même si le type « image » a été choisi par erreur. */
export function normalizeContactGalleryItem(
  item: ResolvedContactMediaItem,
  source?: CmsHomeContactMediaItem,
): ResolvedContactMediaItem {
  if (item.type === "video") return item;

  const media =
    source?.image && typeof source.image === "object"
      ? source.image
      : source?.video && typeof source.video === "object"
        ? source.video
        : null;

  if (media && isVideoMedia(media)) {
    const src = resolveMediaSrc(media);
    if (src) return { type: "video", src };
  }

  return item;
}
