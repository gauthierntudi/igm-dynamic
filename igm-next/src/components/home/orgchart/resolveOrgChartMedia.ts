import { mediaUrl } from "@/lib/cdnUrl";
import { withDeployedBase } from "@/lib/deployBasePath";

import type { CmsMedia } from "@/lib/cms/types";

function toPublicAsset(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return withDeployedBase(normalized);
}

export function resolveOrgChartImageSrc(
  media: CmsMedia | number | null | undefined,
): string | null {
  if (!media || typeof media !== "object") return null;

  const url = mediaUrl(media);
  if (!url) return null;

  if (/^https?:\/\//i.test(url)) return url;
  return toPublicAsset(url);
}

export function resolveOrgChartImageAlt(
  media: CmsMedia | number | null | undefined,
  fallback: string,
): string {
  if (media && typeof media === "object" && media.alt?.trim()) {
    return media.alt.trim();
  }
  return fallback;
}
