import { describe, expect, it } from "vitest";

import {
  isPublishedHomePath,
  localeFromPathname,
  pathnameWithoutBase,
  preferredLocaleFromAcceptLanguage,
  resolveLocaleMiddleware,
  shouldSkipLocaleMiddleware,
  stripExplicitFrPrefix,
  withBasePath,
} from "../middlewareLocale";

describe("shouldSkipLocaleMiddleware", () => {
  it("skips api, admin and static asset paths", () => {
    expect(shouldSkipLocaleMiddleware("/api/contact")).toBe(true);
    expect(shouldSkipLocaleMiddleware("/admin")).toBe(true);
    expect(shouldSkipLocaleMiddleware("/assets/js/app.js")).toBe(true);
    expect(shouldSkipLocaleMiddleware("/contact")).toBe(false);
  });
});

describe("stripExplicitFrPrefix", () => {
  it("redirects /fr paths to default-locale URLs", () => {
    expect(stripExplicitFrPrefix("/fr")).toBe("/");
    expect(stripExplicitFrPrefix("/fr/contact")).toBe("/contact");
    expect(stripExplicitFrPrefix("/en/news")).toBeNull();
  });

  it("supports deployed base path", () => {
    expect(stripExplicitFrPrefix("/igm/fr/contact", "/igm")).toBe("/igm/contact");
    expect(pathnameWithoutBase("/igm/fr/contact", "/igm")).toBe("/fr/contact");
  });
});

describe("preferredLocaleFromAcceptLanguage", () => {
  it("detects French and English preferences", () => {
    expect(preferredLocaleFromAcceptLanguage("fr-FR,fr;q=0.9")).toBe("fr");
    expect(preferredLocaleFromAcceptLanguage("en-US,en;q=0.9")).toBe("en");
    expect(preferredLocaleFromAcceptLanguage("de-DE,de;q=0.9")).toBeNull();
  });
});

describe("resolveLocaleMiddleware", () => {
  it("redirects explicit /fr URLs", () => {
    expect(
      resolveLocaleMiddleware({
        pathname: "/fr/actualites",
        method: "GET",
        acceptLanguage: null,
        localeCookie: undefined,
      }),
    ).toEqual({
      action: "redirect",
      url: "/actualites",
      locale: "fr",
    });
  });

  it("redirects home to /en when Accept-Language prefers English", () => {
    expect(
      resolveLocaleMiddleware({
        pathname: "/",
        method: "GET",
        acceptLanguage: "en-US,en;q=0.9",
        localeCookie: undefined,
      }),
    ).toEqual({
      action: "redirect",
      url: "/en",
      locale: "en",
    });
  });

  it("keeps French home when Accept-Language prefers French", () => {
    expect(
      resolveLocaleMiddleware({
        pathname: "/",
        method: "GET",
        acceptLanguage: "fr-FR,fr;q=0.9",
        localeCookie: undefined,
      }),
    ).toEqual({
      action: "next",
      locale: "fr",
    });
  });

  it("honours locale cookie on home", () => {
    expect(
      resolveLocaleMiddleware({
        pathname: "/",
        method: "GET",
        acceptLanguage: "fr-FR,fr;q=0.9",
        localeCookie: "en",
      }),
    ).toEqual({
      action: "redirect",
      url: "/en",
      locale: "en",
    });
  });

  it("does not auto-redirect deep links", () => {
    expect(
      resolveLocaleMiddleware({
        pathname: "/contact",
        method: "GET",
        acceptLanguage: "en-US,en;q=0.9",
        localeCookie: undefined,
      }),
    ).toEqual({
      action: "next",
      locale: "fr",
    });
  });
});

describe("localeFromPathname", () => {
  it("reads EN prefix", () => {
    expect(localeFromPathname("/en/contact")).toBe("en");
    expect(localeFromPathname("/contact")).toBe("fr");
    expect(localeFromPathname("/igm/en/news", "/igm")).toBe("en");
    expect(withBasePath("/en", "/igm")).toBe("/igm/en");
  });

  it("detects published home paths with base path", () => {
    expect(isPublishedHomePath("/igm", "/igm")).toBe(true);
    expect(isPublishedHomePath("/igm/en", "/igm")).toBe(false);
  });
});
