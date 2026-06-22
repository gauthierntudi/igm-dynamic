import { DEFAULT_LOCALE, localePathPrefix, parseLocaleFromSegments, type SupportedLocale } from "./locales";

/** Clés de routes internes — slugs FR / EN. */
export const ROUTE_KEYS = {
  home: { fr: "", en: "" },
  about: { fr: "a-propos", en: "about" },
  history: { fr: "historique", en: "history" },
  mission: { fr: "mission", en: "mission" },
  vision: { fr: "vision", en: "vision" },
  orgChart: { fr: "organigramme", en: "org-chart" },
  map: { fr: "cartographie", en: "mapping" },
  fraud: { fr: "fraude-miniere", en: "mining-fraud" },
  smuggling: { fr: "contrebande-miniere", en: "mining-smuggling" },
  report: { fr: "denoncer", en: "report" },
  sanctions: { fr: "sanctions", en: "sanctions" },
  news: { fr: "actualites", en: "news" },
  ordinances: { fr: "ordonnances", en: "ordinances" },
  laws: { fr: "lois", en: "laws" },
  decrees: { fr: "decrets", en: "decrees" },
  decisions: { fr: "decisions", en: "decisions" },
  photos: { fr: "photos", en: "photos" },
  videos: { fr: "videos", en: "videos" },
  audios: { fr: "audios", en: "audios" },
  contact: { fr: "contact", en: "contact" },
} as const;

export type RouteKey = keyof typeof ROUTE_KEYS;

/** Trouve la clé de route à partir d’un slug et d’une locale. */
export function findRouteKey(slug: string, locale: SupportedLocale): RouteKey | null {
  for (const [key, slugs] of Object.entries(ROUTE_KEYS) as [RouteKey, (typeof ROUTE_KEYS)[RouteKey]][]) {
    if (slugs[locale] === slug) return key;
  }
  return null;
}

/** URL absolue pour une route connue. */
export function hrefForRoute(routeKey: RouteKey, locale: SupportedLocale = DEFAULT_LOCALE): string {
  const slug = ROUTE_KEYS[routeKey][locale];
  const prefix = localePathPrefix(locale);
  if (!slug) return prefix || "/";
  return `${prefix}/${slug}`;
}

/** Préfixe un chemin interne avec la locale (mappe les routes connues). */
export function localizeHref(href: string, locale: SupportedLocale = DEFAULT_LOCALE): string {
  const trimmed = href.trim();
  if (!trimmed || /^(https?:|mailto:|tel:|javascript:|#)/i.test(trimmed)) {
    return trimmed;
  }

  const path = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  const segments = path.split("/").filter(Boolean);
  const { locale: hrefLocale, pathSegments } = parseLocaleFromSegments(segments);
  const slug = pathSegments.join("/");

  if (!slug) return hrefForRoute("home", locale);

  const routeKey = findRouteKey(slug, hrefLocale);
  if (routeKey) return hrefForRoute(routeKey, locale);

  const prefix = localePathPrefix(locale);
  return prefix ? `${prefix}/${slug}` : `/${slug}`;
}

/** URL équivalente dans une autre langue (navigation, sélecteur FR/EN). */
export function switchLocaleHref(pathname: string, targetLocale: SupportedLocale): string {
  const segments = pathname.split("/").filter(Boolean);
  const { locale: currentLocale, pathSegments } = parseLocaleFromSegments(segments);

  if (pathSegments.length === 0) {
    return hrefForRoute("home", targetLocale);
  }

  const slug = pathSegments.join("/");
  const routeKey = findRouteKey(slug, currentLocale);

  if (routeKey) {
    return hrefForRoute(routeKey, targetLocale);
  }

  const prefix = localePathPrefix(targetLocale);
  return prefix ? `${prefix}/${slug}` : `/${slug}`;
}

/** Chemin interne du menu Payload → URL localisée. */
export function localizeNavLinkValue(value: string, locale: SupportedLocale): string {
  if (!value || value === "/") return hrefForRoute("home", locale);
  return localizeHref(value, locale);
}
