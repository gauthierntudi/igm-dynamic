/** URL publique CloudFront / CDN pour les médias éditoriaux. */
export function cdnUrl(path: string | null | undefined): string {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;

  const base = process.env.NEXT_PUBLIC_CDN_URL?.replace(/\/$/, "");
  if (!base) return path.startsWith("/") ? path : `/${path}`;

  return `${base}/${path.replace(/^\//, "")}`;
}

type MediaLike = {
  url?: string | null;
  filename?: string | null;
  prefix?: string | null;
};

/** URL publique d’un média Payload — CDN / URL absolue prioritaire. */
export function mediaUrl(media: MediaLike | null | undefined): string {
  if (!media) return "";

  if (media.url && /^https?:\/\//i.test(media.url)) {
    return media.url;
  }

  if (media.filename) {
    const fromFilename = cdnUrl(
      [media.prefix, media.filename].filter(Boolean).join("/"),
    );
    if (fromFilename) return fromFilename;
  }

  if (media.url) {
    if (media.url.includes("/api/") && media.filename) {
      return cdnUrl([media.prefix, media.filename].filter(Boolean).join("/"));
    }
    return cdnUrl(media.url);
  }

  return "";
}
