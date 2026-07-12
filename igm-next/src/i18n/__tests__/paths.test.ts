import { describe, expect, it } from "vitest";

import {
  hrefForAboutHistorySection,
  hrefForNewsArticle,
  hrefForNewsListing,
  hrefForRoute,
  isHistoryPageHref,
  localizeHref,
  resolveHistoryNavHref,
  switchLocaleHref,
} from "../paths";

describe("hrefForRoute", () => {
  it("builds home URLs without FR prefix", () => {
    expect(hrefForRoute("home", "fr")).toBe("/");
    expect(hrefForRoute("home", "en")).toBe("/en");
  });

  it("localizes slugs per locale", () => {
    expect(hrefForRoute("news", "fr")).toBe("/actualites");
    expect(hrefForRoute("news", "en")).toBe("/en/news");
    expect(hrefForRoute("contact", "fr")).toBe("/contact");
    expect(hrefForRoute("contact", "en")).toBe("/en/contact");
  });
});

describe("hrefForNewsArticle", () => {
  it("appends article slug under the news section", () => {
    expect(hrefForNewsArticle("reforme-miniere", "fr")).toBe("/actualites/reforme-miniere");
    expect(hrefForNewsArticle("reforme-miniere", "en")).toBe("/en/news/reforme-miniere");
  });
});

describe("hrefForNewsListing", () => {
  it("adds search and pagination query params", () => {
    expect(hrefForNewsListing("fr", { q: "mines", page: 2 })).toBe(
      "/actualites?q=mines&page=2",
    );
    expect(hrefForNewsListing("en", { page: 3 })).toBe("/en/news?page=3");
  });
});

describe("localizeHref", () => {
  it("rewrites internal paths to the target locale", () => {
    expect(localizeHref("/ordonnances", "en")).toBe("/en/ordinances");
    expect(localizeHref("/en/laws", "fr")).toBe("/lois");
  });

  it("preserves hash fragments on internal paths", () => {
    expect(localizeHref("/a-propos#igm-wwa-history", "en")).toBe("/en/about#igm-wwa-history");
    expect(localizeHref("/en/about#igm-wwa-history", "fr")).toBe("/a-propos#igm-wwa-history");
  });

  it("leaves external URLs unchanged", () => {
    expect(localizeHref("https://example.com", "en")).toBe("https://example.com");
    expect(localizeHref("mailto:contact@igm.cd", "fr")).toBe("mailto:contact@igm.cd");
  });
});

describe("resolveHistoryNavHref", () => {
  it("maps legacy history page links to the about section anchor", () => {
    expect(resolveHistoryNavHref("/historique", "fr")).toBe("/a-propos#igm-wwa-history");
    expect(resolveHistoryNavHref("/historique", "en")).toBe("/en/about#igm-wwa-history");
    expect(resolveHistoryNavHref("/en/history", "fr")).toBe("/a-propos#igm-wwa-history");
  });

  it("leaves other internal links unchanged aside from locale mapping", () => {
    expect(resolveHistoryNavHref("/mission", "en")).toBe("/en/mission");
  });
});

describe("hrefForAboutHistorySection", () => {
  it("builds localized about page anchors", () => {
    expect(hrefForAboutHistorySection("fr")).toBe("/a-propos#igm-wwa-history");
    expect(hrefForAboutHistorySection("en")).toBe("/en/about#igm-wwa-history");
  });
});

describe("isHistoryPageHref", () => {
  it("detects legacy history routes", () => {
    expect(isHistoryPageHref("/historique")).toBe(true);
    expect(isHistoryPageHref("/en/history")).toBe(true);
    expect(isHistoryPageHref("/a-propos#igm-wwa-history")).toBe(false);
  });
});

describe("switchLocaleHref", () => {
  it("switches home and static routes", () => {
    expect(switchLocaleHref("/", "en")).toBe("/en");
    expect(switchLocaleHref("/en", "fr")).toBe("/");
    expect(switchLocaleHref("/contact", "en")).toBe("/en/contact");
    expect(switchLocaleHref("/en/contact", "fr")).toBe("/contact");
  });

  it("switches news article paths while keeping slug", () => {
    expect(switchLocaleHref("/actualites/reforme-miniere", "en")).toBe(
      "/en/news/reforme-miniere",
    );
    expect(switchLocaleHref("/en/news/reforme-miniere", "fr")).toBe(
      "/actualites/reforme-miniere",
    );
  });

  it("switches photo album paths", () => {
    expect(switchLocaleHref("/photos/ceremony-2024", "en")).toBe("/en/photos/ceremony-2024");
    expect(switchLocaleHref("/en/photos/ceremony-2024", "fr")).toBe("/photos/ceremony-2024");
  });

  it("preserves unknown CMS slugs with locale prefix only", () => {
    expect(switchLocaleHref("/custom-cms-page", "en")).toBe("/en/custom-cms-page");
    expect(switchLocaleHref("/en/custom-cms-page", "fr")).toBe("/custom-cms-page");
  });
});
