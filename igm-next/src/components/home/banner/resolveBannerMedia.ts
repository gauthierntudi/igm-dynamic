import { mediaUrl } from "@/lib/cdnUrl";
import { withDeployedBase } from "@/lib/deployBasePath";

import type { CmsMedia } from "@/lib/cms/types";

function toPublicAsset(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return withDeployedBase(normalized);
}

export function resolveBannerImageSrc(
  media: CmsMedia | number | null | undefined,
  fallbackIndex: number,
): string {
  if (media && typeof media === "object") {
    const url = mediaUrl(media);
    if (url) {
      if (/^https?:\/\//i.test(url)) return url;
      return toPublicAsset(url);
    }
  }

  return toPublicAsset(`/assets/img/slides/${(fallbackIndex % 5) + 1}.jpg`);
}

export function resolveBannerVideoSrc(
  media: CmsMedia | number | null | undefined,
  fallback = "/assets/video/mining.mp4",
): string {
  if (media && typeof media === "object") {
    const url = mediaUrl(media);
    if (url) {
      if (/^https?:\/\//i.test(url)) return url;
      return toPublicAsset(url);
    }
  }

  return toPublicAsset(fallback);
}
