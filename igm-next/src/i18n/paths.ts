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

/** Slug d’article actualités si l’URL est `actualites/{slug}` ou `news/{slug}`. */
export function parseNewsArticleSlug(
  pathSegments: string[],
  locale: SupportedLocale,
): string | null {
  if (pathSegments.length !== 2) return null;
  const [sectionSlug, articleSlug] = pathSegments;
  if (findRouteKey(sectionSlug, locale) !== "news") return null;
  return articleSlug;
}

/** URL d’un article actualités pour une locale donnée. */
export function hrefForNewsArticle(slug: string, locale: SupportedLocale): string {
  return `${hrefForRoute("news", locale)}/${slug}`;
}

/** URL d’un album photo pour une locale donnée. */
export function hrefForPhotoAlbum(slug: string, locale: SupportedLocale): string {
  return `${hrefForRoute("photos", locale)}/${slug}`;
}

/** True si le chemin est la page liste photos (`/photos`). */
export function isPhotosListingPath(
  pathSegments: string[],
  locale: SupportedLocale,
): boolean {
  if (pathSegments.length !== 1) return false;
  return findRouteKey(pathSegments[0], locale) === "photos";
}

/** Slug d’album si l’URL est `photos/{slug}`. */
export function parsePhotoAlbumSlug(
  pathSegments: string[],
  locale: SupportedLocale,
): string | null {
  if (pathSegments.length !== 2) return null;
  const [sectionSlug, albumSlug] = pathSegments;
  if (findRouteKey(sectionSlug, locale) !== "photos") return null;
  return albumSlug;
}

/** True si le chemin est la page liste actualités (`actualites` / `news`). */
export function isNewsListingPath(
  pathSegments: string[],
  locale: SupportedLocale,
): boolean {
  if (pathSegments.length !== 1) return false;
  return findRouteKey(pathSegments[0], locale) === "news";
}

export type WhoWeAreSectionId = "about" | "history" | "mission";

const WHO_WE_ARE_ROUTE_KEYS: WhoWeAreSectionId[] = ["about", "history", "mission"];

/** Section « Qui sommes-nous » si le slug est `a-propos`, `historique`, `mission`, etc. */
export function parseWhoWeAreSection(
  pathSegments: string[],
  locale: SupportedLocale,
): WhoWeAreSectionId | null {
  if (pathSegments.length !== 1) return null;
  const routeKey = findRouteKey(pathSegments[0], locale);
  if (!routeKey || !WHO_WE_ARE_ROUTE_KEYS.includes(routeKey as WhoWeAreSectionId)) {
    return null;
  }
  return routeKey as WhoWeAreSectionId;
}

export type NewsListingQuery = {
  page?: number;
  q?: string;
};

/** URL de la page liste actualités avec pagination / recherche. */
export function hrefForNewsListing(
  locale: SupportedLocale,
  query: NewsListingQuery = {},
): string {
  const base = hrefForRoute("news", locale);
  const params = new URLSearchParams();
  if (query.q?.trim()) params.set("q", query.q.trim());
  if (query.page && query.page > 1) params.set("page", String(query.page));
  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
}

/** URL équivalente dans une autre langue (navigation, sélecteur FR/EN). */
export function switchLocaleHref(pathname: string, targetLocale: SupportedLocale): string {
  const segments = pathname.split("/").filter(Boolean);
  const { locale: currentLocale, pathSegments } = parseLocaleFromSegments(segments);

  if (pathSegments.length === 0) {
    return hrefForRoute("home", targetLocale);
  }

  const newsSlug = parseNewsArticleSlug(pathSegments, currentLocale);
  if (newsSlug) {
    return hrefForNewsArticle(newsSlug, targetLocale);
  }

  const photoAlbumSlug = parsePhotoAlbumSlug(pathSegments, currentLocale);
  if (photoAlbumSlug) {
    return hrefForPhotoAlbum(photoAlbumSlug, targetLocale);
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
