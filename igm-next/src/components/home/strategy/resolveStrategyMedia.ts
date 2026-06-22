import { mediaUrl } from "@/lib/cdnUrl";
import { withDeployedBase } from "@/lib/deployBasePath";

import type { CmsMedia } from "@/lib/cms/types";

function toPublicAsset(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return withDeployedBase(normalized);
}

const DEFAULT_STRATEGY_VIDEO = "/assets/video/mining.mp4";

export function resolveStrategyVideoSrc(
  media: CmsMedia | number | null | undefined,
): string {
  if (media && typeof media === "object") {
    const url = mediaUrl(media);
    if (url) {
      if (/^https?:\/\//i.test(url)) return url;
      return toPublicAsset(url);
    }
  }

  return toPublicAsset(DEFAULT_STRATEGY_VIDEO);
}
