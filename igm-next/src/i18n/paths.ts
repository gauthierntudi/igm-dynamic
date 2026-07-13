import { DEFAULT_LOCALE, localePathPrefix, parseLocaleFromSegments, type SupportedLocale } from "./locales";

/** Clés de routes internes — slugs FR / EN. */
export const ROUTE_KEYS = {
  home: { fr: "", en: "" },
  about: { fr: "a-propos", en: "about" },
  history: { fr: "historique", en: "history" },
  mission: { fr: "mission", en: "mission" },
  vision: { fr: "vision", en: "vision" },
  orgChart: { fr: "organigramme", en: "org-chart" },
  pressKit: { fr: "dossier-de-presse", en: "press-kit" },
  map: { fr: "cartographie", en: "mapping" },
  fraud: { fr: "fraude-miniere", en: "mining-fraud" },
  smuggling: { fr: "contrebande-miniere", en: "mining-smuggling" },
  report: { fr: "denoncer", en: "report" },
  sanctions: { fr: "sanctions", en: "sanctions" },
  strategy: { fr: "strategie", en: "strategy" },
  news: { fr: "actualites", en: "news" },
  ordinances: { fr: "ordonnances", en: "ordinances" },
  laws: { fr: "lois", en: "laws" },
  decrees: { fr: "decrets", en: "decrees" },
  decisions: { fr: "decisions", en: "decisions" },
  photos: { fr: "photos", en: "photos" },
  videos: { fr: "videos", en: "videos" },
  pressReview: { fr: "revue-de-presse", en: "press-review" },
  contact: { fr: "contact", en: "contact" },
  terms: { fr: "conditions-generales", en: "terms-and-conditions" },
  cookies: { fr: "politique-cookies", en: "cookie-policy" },
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

/** Ancre de la section Historique sur /a-propos. */
export const WHO_WE_ARE_HISTORY_SECTION_ID = "igm-wwa-history";

/** Lien menu vers la frise Historique (section de la page À propos). */
export function hrefForAboutHistorySection(locale: SupportedLocale = DEFAULT_LOCALE): string {
  return `${hrefForRoute("about", locale)}#${WHO_WE_ARE_HISTORY_SECTION_ID}`;
}

function splitHrefHash(href: string): { path: string; hash: string } {
  const hashIndex = href.indexOf("#");
  if (hashIndex < 0) return { path: href, hash: "" };
  return { path: href.slice(0, hashIndex), hash: href.slice(hashIndex) };
}

/** True si l’URL cible l’ancienne page Historique (/historique, /history). */
export function isHistoryPageHref(href: string): boolean {
  const { path } = splitHrefHash(href.trim());
  const normalized = path.replace(/\/$/, "") || "/";
  return (
    normalized === "/historique" ||
    normalized === "/history" ||
    normalized === "/en/history" ||
    normalized === "/en/historique"
  );
}

/** Résout un lien menu Historique vers la section de /a-propos. */
export function resolveHistoryNavHref(
  href: string,
  locale: SupportedLocale = DEFAULT_LOCALE,
): string {
  if (isHistoryPageHref(href)) {
    return hrefForAboutHistorySection(locale);
  }
  return localizeHref(href, locale);
}

/** Préfixe un chemin interne avec la locale (mappe les routes connues). */
export function localizeHref(href: string, locale: SupportedLocale = DEFAULT_LOCALE): string {
  const trimmed = href.trim();
  if (!trimmed || /^(https?:|mailto:|tel:|javascript:)/i.test(trimmed)) {
    return trimmed;
  }
  if (trimmed.startsWith("#")) return trimmed;

  const { path: pathPart, hash: hashPart } = splitHrefHash(trimmed);
  const path = pathPart.startsWith("/") ? pathPart : `/${pathPart}`;
  const segments = path.split("/").filter(Boolean);
  const { locale: hrefLocale, pathSegments } = parseLocaleFromSegments(segments);
  const slug = pathSegments.join("/");

  let localized: string;
  if (!slug) {
    localized = hrefForRoute("home", locale);
  } else {
    const routeKey = findRouteKey(slug, hrefLocale);
    if (routeKey) {
      localized = hrefForRoute(routeKey, locale);
    } else {
      const prefix = localePathPrefix(locale);
      localized = prefix ? `${prefix}/${slug}` : `/${slug}`;
    }
  }

  return `${localized}${hashPart}`;
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

/** Slug d’article revue de presse si l’URL est `revue-de-presse/{slug}` ou `press-review/{slug}`. */
export function parsePressReviewArticleSlug(
  pathSegments: string[],
  locale: SupportedLocale,
): string | null {
  if (pathSegments.length !== 2) return null;
  const [sectionSlug, articleSlug] = pathSegments;
  if (findRouteKey(sectionSlug, locale) !== "pressReview") return null;
  return articleSlug;
}

/** URL d’un article actualités pour une locale donnée. */
export function hrefForNewsArticle(slug: string, locale: SupportedLocale): string {
  return `${hrefForRoute("news", locale)}/${slug}`;
}

/** URL d’un article revue de presse pour une locale donnée. */
export function hrefForPressReviewArticle(slug: string, locale: SupportedLocale): string {
  return `${hrefForRoute("pressReview", locale)}/${slug}`;
}

/** URL d’un article selon sa catégorie CMS. */
export function hrefForNewsItem(
  article: { slug: string; category?: string | null },
  locale: SupportedLocale,
): string {
  if (article.category === "revue-de-presse") {
    return hrefForPressReviewArticle(article.slug, locale);
  }
  return hrefForNewsArticle(article.slug, locale);
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

/** True si le chemin est la page liste revue de presse (`revue-de-presse` / `press-review`). */
export function isPressReviewListingPath(
  pathSegments: string[],
  locale: SupportedLocale,
): boolean {
  if (pathSegments.length !== 1) return false;
  return findRouteKey(pathSegments[0], locale) === "pressReview";
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

/** URL de la page liste revue de presse avec pagination / recherche. */
export function hrefForPressReviewListing(
  locale: SupportedLocale,
  query: NewsListingQuery = {},
): string {
  const base = hrefForRoute("pressReview", locale);
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

  const pressReviewSlug = parsePressReviewArticleSlug(pathSegments, currentLocale);
  if (pressReviewSlug) {
    return hrefForPressReviewArticle(pressReviewSlug, targetLocale);
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
