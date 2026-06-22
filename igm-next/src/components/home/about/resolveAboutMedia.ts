import { mediaUrl } from "@/lib/cdnUrl";
import { withDeployedBase } from "@/lib/deployBasePath";

import type { CmsMedia } from "@/lib/cms/types";

function toPublicAsset(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return withDeployedBase(normalized);
}

export function resolveAboutImageSrc(
  media: CmsMedia | number | null | undefined,
): string {
  if (media && typeof media === "object") {
    const url = mediaUrl(media);
    if (url) {
      if (/^https?:\/\//i.test(url)) return url;
      return toPublicAsset(url);
    }
  }

  return toPublicAsset("/assets/img/img-07.jpg");
}

export function resolveAboutImageAlt(
  media: CmsMedia | number | null | undefined,
  fallback = "IGM",
): string {
  if (media && typeof media === "object" && media.alt?.trim()) {
    return media.alt.trim();
  }
  return fallback;
}
