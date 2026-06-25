import type { SupportedLocale } from "@/i18n/locales";

export function formatNewsDate(iso: string, locale: SupportedLocale): string {
  try {
    return new Date(iso).toLocaleDateString(locale === "en" ? "en-GB" : "fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

/** Date longue pour le hero (ex. « 2 juin 2026 » / « June 2, 2026 »). */
export function formatNewsDateLong(iso: string, locale: SupportedLocale): string {
  try {
    return new Date(iso).toLocaleDateString(locale === "en" ? "en-US" : "fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}
