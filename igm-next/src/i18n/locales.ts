/** Langues supportées sur le site et dans Payload CMS. */
export const SUPPORTED_LOCALES = ["fr", "en"] as const;

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: SupportedLocale = "fr";

export const LOCALE_LABELS: Record<SupportedLocale, string> = {
  fr: "Français",
  en: "English",
};

/** Préfixe URL pour une locale (ex. `/en/about`). Le français reste sans préfixe par défaut. */
export function localePathPrefix(locale: SupportedLocale): string {
  return locale === DEFAULT_LOCALE ? "" : `/${locale}`;
}

export function isSupportedLocale(value: string): value is SupportedLocale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(value);
}

/** Extrait la locale et le chemin depuis les segments d’URL (`['en', 'about']` → locale `en`, path `about`). */
export function parseLocaleFromSegments(segments: string[]): {
  locale: SupportedLocale;
  pathSegments: string[];
} {
  if (segments.length > 0 && isSupportedLocale(segments[0])) {
    return { locale: segments[0], pathSegments: segments.slice(1) };
  }
  return { locale: DEFAULT_LOCALE, pathSegments: segments };
}
