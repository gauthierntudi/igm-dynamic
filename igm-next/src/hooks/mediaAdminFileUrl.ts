import type { CollectionAfterReadHook } from "payload";

function apiMediaFileUrl(
  apiRoute: string,
  filename: string,
  prefix?: string | null,
): string {
  const qs =
    typeof prefix === "string" && prefix
      ? `?prefix=${encodeURIComponent(prefix)}`
      : "";
  return `${apiRoute}/media/file/${encodeURIComponent(filename)}${qs}`;
}

/** En admin, URLs same-origin (Payload stream S3) pour le cropper d’images. */
export const mediaAdminFileUrl: CollectionAfterReadHook = ({ doc, req }) => {
  if (!req?.user || !doc?.filename || typeof doc.filename !== "string") {
    return doc;
  }

  const apiRoute = req.payload.config.routes?.api || "/api";
  const prefix = typeof doc.prefix === "string" ? doc.prefix : null;

  const next: Record<string, unknown> = {
    ...doc,
    url: apiMediaFileUrl(apiRoute, doc.filename, prefix),
  };

  if (doc.sizes && typeof doc.sizes === "object") {
    const sizes = { ...(doc.sizes as Record<string, Record<string, unknown>>) };
    for (const [key, size] of Object.entries(sizes)) {
      if (size?.filename && typeof size.filename === "string") {
        sizes[key] = {
          ...size,
          url: apiMediaFileUrl(apiRoute, size.filename, prefix),
        };
      }
    }
    next.sizes = sizes;

    if (typeof doc.mimeType === "string" && doc.mimeType.startsWith("video/")) {
      const poster = sizes.poster;
      if (poster?.url && typeof poster.url === "string") {
        next.thumbnailURL = poster.url;
      }
    }
  }

  return next;
};
