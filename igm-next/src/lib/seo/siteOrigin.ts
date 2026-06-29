/** Origine publique du site (sans slash final). */
export function getSiteOrigin(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SERVER_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");

  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) return `https://${vercel.replace(/\/$/, "")}`;

  return "http://localhost:3000";
}

/** Chemin absolu sur le site (ex. `/actualites/mon-article`). */
export function absoluteSiteUrl(pathname: string): string {
  const origin = getSiteOrigin();
  if (!pathname || pathname === "/") return origin;
  const normalized = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${origin}${normalized}`;
}

/** Résout une URL d’image (CDN, relative ou absolue) en URL absolue pour Open Graph. */
export function absoluteOgImageUrl(src: string | null | undefined): string | undefined {
  if (!src?.trim()) return undefined;

  const value = src.trim();
  if (/^https?:\/\//i.test(value)) return value;

  const path = value.startsWith("/") ? value : `/${value}`;
  return absoluteSiteUrl(path);
}
