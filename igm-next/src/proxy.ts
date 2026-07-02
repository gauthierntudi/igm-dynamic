import { NextResponse, type NextRequest } from "next/server";

import {
  LOCALE_COOKIE_MAX_AGE,
  LOCALE_COOKIE_NAME,
  localeCookiePath,
} from "@/lib/i18n/localeCookie";
import {
  normalizeBasePath,
  resolveLocaleMiddleware,
} from "@/lib/i18n/middlewareLocale";

function envFlag(name: string, defaultValue: boolean): boolean {
  const raw = process.env[name]?.trim().toLowerCase();
  if (raw === "true" || raw === "1" || raw === "yes") return true;
  if (raw === "false" || raw === "0" || raw === "no") return false;
  return defaultValue;
}

function applyLocaleCookie(response: NextResponse, locale: string, basePath: string) {
  response.cookies.set(LOCALE_COOKIE_NAME, locale, {
    path: localeCookiePath(basePath),
    maxAge: LOCALE_COOKIE_MAX_AGE,
    sameSite: "lax",
  });
  response.headers.set("x-igm-locale", locale);
}

export function proxy(request: NextRequest) {
  const basePath = normalizeBasePath(process.env.BASE_PATH);
  const pathname = request.nextUrl.pathname;

  const decision = resolveLocaleMiddleware({
    pathname,
    method: request.method,
    acceptLanguage: request.headers.get("accept-language"),
    localeCookie: request.cookies.get(LOCALE_COOKIE_NAME)?.value,
    basePath,
    acceptLanguageRedirectEnabled: envFlag("LOCALE_ACCEPT_LANGUAGE_REDIRECT", true),
  });

  if (!decision) {
    return NextResponse.next();
  }

  if (decision.action === "redirect") {
    const url = request.nextUrl.clone();
    url.pathname = decision.url;
    const response = NextResponse.redirect(url);
    applyLocaleCookie(response, decision.locale, basePath);
    return response;
  }

  const response = NextResponse.next();
  applyLocaleCookie(response, decision.locale, basePath);
  return response;
}

export const config = {
  matcher: [
    "/((?!api|admin|_next/static|_next/image|favicon.ico|assets|template_next).*)",
  ],
};
