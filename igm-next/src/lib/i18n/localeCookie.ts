export const LOCALE_COOKIE_NAME = "igm_locale";

export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export function localeCookiePath(basePath = ""): string {
  return basePath || "/";
}
