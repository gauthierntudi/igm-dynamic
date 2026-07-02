import {
  DEFAULT_LOCALE,
  isSupportedLocale,
  type SupportedLocale,
} from "@/i18n/locales";

export type LocaleMiddlewareInput = {
  pathname: string;
  method: string;
  acceptLanguage: string | null;
  localeCookie: string | undefined;
  basePath?: string;
  acceptLanguageRedirectEnabled?: boolean;
};

export type LocaleMiddlewareResult =
  | { action: "next"; locale: SupportedLocale }
  | { action: "redirect"; url: string; locale: SupportedLocale };

const SKIP_PREFIXES = [
  "/api",
  "/admin",
  "/_next",
  "/assets",
  "/template_next",
  "/favicon.ico",
];

export function normalizeBasePath(basePath?: string): string {
  const raw = basePath?.trim();
  if (!raw || raw === "/") return "";
  let normalized = raw.replace(/\/$/, "");
  if (!normalized.startsWith("/")) {
    normalized = `/${normalized}`;
  }
  return normalized;
}

export function pathnameWithoutBase(pathname: string, basePath?: string): string {
  const base = normalizeBasePath(basePath);
  if (!base) return pathname || "/";
  if (pathname === base) return "/";
  if (pathname.startsWith(`${base}/`)) {
    return pathname.slice(base.length) || "/";
  }
  return pathname || "/";
}

export function withBasePath(pathname: string, basePath?: string): string {
  const base = normalizeBasePath(basePath);
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  if (!base) return path;
  if (path === "/") return `${base}/`;
  return `${base}${path}`;
}

export function shouldSkipLocaleMiddleware(pathname: string, basePath?: string): boolean {
  const path = pathnameWithoutBase(pathname, basePath);
  if (SKIP_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`))) {
    return true;
  }
  if (/\.[a-z0-9]+$/i.test(path)) {
    return true;
  }
  return false;
}

export function localeFromPathname(pathname: string, basePath?: string): SupportedLocale {
  const path = pathnameWithoutBase(pathname, basePath);
  const segments = path.split("/").filter(Boolean);
  if (segments[0] === "en") return "en";
  return DEFAULT_LOCALE;
}

/** `/fr` et `/fr/...` → même chemin sans le préfixe français explicite. */
export function stripExplicitFrPrefix(pathname: string, basePath?: string): string | null {
  const path = pathnameWithoutBase(pathname, basePath);
  if (path === "/fr") {
    return withBasePath("/", basePath);
  }
  if (path.startsWith("/fr/")) {
    return withBasePath(path.slice(3), basePath);
  }
  return null;
}

export function isPublishedHomePath(pathname: string, basePath?: string): boolean {
  const path = pathnameWithoutBase(pathname, basePath);
  return path === "/" || path === "/marketing-agency";
}

/**
 * Retourne `en` si l'en-tête Accept-Language indique clairement l'anglais.
 * Ne force pas le français — évite les redirections agressives.
 */
export function preferredLocaleFromAcceptLanguage(
  acceptLanguage: string | null,
): SupportedLocale | null {
  if (!acceptLanguage?.trim()) return null;

  const tags = acceptLanguage
    .split(",")
    .map((part) => {
      const [tag, weightPart] = part.trim().split(";q=");
      const weight = weightPart ? Number.parseFloat(weightPart) : 1;
      return { tag: tag.trim().toLowerCase(), weight: Number.isFinite(weight) ? weight : 0 };
    })
    .filter((entry) => entry.tag)
    .sort((a, b) => b.weight - a.weight);

  for (const { tag } of tags) {
    if (tag === "fr" || tag.startsWith("fr-")) return DEFAULT_LOCALE;
    if (tag === "en" || tag.startsWith("en-")) return "en";
  }

  return null;
}

export function resolveLocaleMiddleware(
  input: LocaleMiddlewareInput,
): LocaleMiddlewareResult | null {
  const basePath = normalizeBasePath(input.basePath);

  if (shouldSkipLocaleMiddleware(input.pathname, basePath)) {
    return null;
  }

  const strippedFr = stripExplicitFrPrefix(input.pathname, basePath);
  if (strippedFr) {
    return { action: "redirect", url: strippedFr, locale: DEFAULT_LOCALE };
  }

  const pathLocale = localeFromPathname(input.pathname, basePath);
  const cookieLocale =
    input.localeCookie && isSupportedLocale(input.localeCookie)
      ? input.localeCookie
      : undefined;

  if (input.method !== "GET" && input.method !== "HEAD") {
    return { action: "next", locale: pathLocale };
  }

  const acceptRedirect = input.acceptLanguageRedirectEnabled !== false;
  const path = pathnameWithoutBase(input.pathname, basePath);

  if (acceptRedirect && isPublishedHomePath(input.pathname, basePath)) {
    const preferred =
      cookieLocale ?? preferredLocaleFromAcceptLanguage(input.acceptLanguage);

    if (preferred === "en" && pathLocale === DEFAULT_LOCALE) {
      return {
        action: "redirect",
        url: withBasePath("/en", basePath),
        locale: "en",
      };
    }

    if (preferred === DEFAULT_LOCALE && path === "/en") {
      return {
        action: "redirect",
        url: withBasePath("/", basePath),
        locale: DEFAULT_LOCALE,
      };
    }
  }

  if (cookieLocale === "en" && pathLocale === DEFAULT_LOCALE && path === "/") {
    return {
      action: "redirect",
      url: withBasePath("/en", basePath),
      locale: "en",
    };
  }

  return { action: "next", locale: pathLocale };
}
