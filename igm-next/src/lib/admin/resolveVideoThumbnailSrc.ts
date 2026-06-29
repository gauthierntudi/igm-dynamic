import { getBestFitFromSizes, isImage } from "payload/shared";

type MediaLike = {
  mimeType?: string | null;
  thumbnailURL?: string | null;
  url?: string | null;
  width?: number | null;
  sizes?: {
    poster?: {
      filename?: string | null;
      url?: string | null;
    };
  } | null;
};

function toAbsoluteUrl(src: string, serverURL: string): string {
  try {
    return new URL(src, serverURL).toString();
  } catch {
    return `${serverURL}${src}`;
  }
}

/** URL de vignette pour l’admin (poster vidéo ou image). */
export function resolveMediaThumbnailSrc(
  value: MediaLike | null | undefined,
  serverURL: string,
): string | undefined {
  if (!value) return undefined;

  if (typeof value.thumbnailURL === "string" && value.thumbnailURL) {
    return toAbsoluteUrl(value.thumbnailURL, serverURL);
  }

  if (typeof value.mimeType === "string" && value.mimeType.startsWith("video/")) {
    const poster = value.sizes?.poster;
    if (poster?.url) return toAbsoluteUrl(poster.url, serverURL);
    return undefined;
  }

  let src: string | undefined;
  if (value.url) src = toAbsoluteUrl(value.url, serverURL);

  if (value.mimeType && isImage(value.mimeType) && src) {
    return getBestFitFromSizes({
      sizes: value.sizes as Record<string, { url?: string; width?: number }> | undefined,
      thumbnailURL: undefined,
      url: src,
      width: value.width ?? undefined,
    });
  }

  return src;
}
