/** URL publique CloudFront (ou S3) pour les médias du site. */
export function publicMediaUrl(prefix: string | undefined, filename: string | undefined): string | null {
  if (!filename || typeof filename !== "string") return null;

  const cdn = process.env.NEXT_PUBLIC_CDN_URL?.replace(/\/$/, "");
  if (!cdn) return null;

  const parts = [prefix, filename].filter(Boolean);
  return `${cdn}/${parts.join("/")}`;
}
