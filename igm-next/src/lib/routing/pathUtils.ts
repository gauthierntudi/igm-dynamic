import { parseLocaleFromSegments } from "@/i18n/locales";
import { pathnameWithoutBase } from "@/lib/i18n/middlewareLocale";

export function isPublishedHomePage(segments: string[]): boolean {
  if (segments.length === 0) return true;
  if (segments.length === 1 && segments[0] === "marketing-agency") return true;
  return false;
}

/** True pour l’accueil FR (`/`, `/marketing-agency`) et EN (`/en`, `/en/marketing-agency`). */
export function isSiteHomePathname(pathname: string, basePath?: string): boolean {
  const path = pathnameWithoutBase(pathname, basePath);
  const segments = path.split("/").filter(Boolean);
  const { pathSegments } = parseLocaleFromSegments(segments);
  return isPublishedHomePage(pathSegments);
}

export function pageSlugFromSegments(segments: string[]): string {
  return segments.join("/");
}
