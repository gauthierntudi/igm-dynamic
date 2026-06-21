/** URL publique CloudFront / CDN pour les médias éditoriaux. */
export function cdnUrl(path: string | null | undefined): string {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;

  const base = process.env.NEXT_PUBLIC_CDN_URL?.replace(/\/$/, "");
  if (!base) return path.startsWith("/") ? path : `/${path}`;

  return `${base}/${path.replace(/^\//, "")}`;
}

/** URL d’un objet Payload media (champ url ou filename + prefix). */
export function mediaUrl(media: { url?: string | null; filename?: string | null } | null | undefined): string {
  if (!media) return "";
  if (media.url) return cdnUrl(media.url);
  if (media.filename) return cdnUrl(media.filename);
  return "";
}
