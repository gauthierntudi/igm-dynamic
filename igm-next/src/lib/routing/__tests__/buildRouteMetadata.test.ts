import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/cms/client", () => ({
  getHome: vi.fn(),
}));

import { getHome } from "@/lib/cms/client";
import { buildMatchContext } from "@/lib/routing/resolve/buildContext";
import { buildHomeMetadata } from "@/lib/routing/handlers/home";
import { buildNewsArticleMetadata, buildNewsListingMetadata } from "@/lib/routing/handlers/news";
import { buildReportMetadata } from "@/lib/routing/handlers/signalement";
import { buildPlaceholderMetadata } from "@/lib/routing/handlers/underConstruction";

const mockArticle = {
  id: "1",
  slug: "reforme-miniere",
  title: "Réforme minière",
  excerpt: "Résumé de l'article.",
  publishedAt: "2026-01-15T10:00:00.000Z",
};

beforeEach(() => {
  vi.mocked(getHome).mockReset();
  vi.mocked(getHome).mockResolvedValue(null);
});

describe("buildNewsArticleMetadata", () => {
  it("sets article Open Graph fields and canonical path", async () => {
    const route = {
      kind: "news-article" as const,
      article: mockArticle,
      ...buildMatchContext(["actualites", "reforme-miniere"]),
    };

    const metadata = await buildNewsArticleMetadata(route);

    expect(metadata.title).toBe("Réforme minière — IGM");
    expect(metadata.description).toBe("Résumé de l'article.");
    expect(metadata.openGraph?.type).toBe("article");
    expect(metadata.openGraph?.publishedTime).toBe("2026-01-15T10:00:00.000Z");
    expect(metadata.alternates?.canonical).toContain("/actualites/reforme-miniere");
  });
});

describe("buildNewsListingMetadata", () => {
  it("uses localized listing titles for FR and EN", async () => {
    const frRoute = {
      kind: "news-listing" as const,
      page: 1,
      q: "",
      ...buildMatchContext(["actualites"]),
    };
    const enRoute = {
      kind: "news-listing" as const,
      page: 1,
      q: "",
      ...buildMatchContext(["en", "news"]),
    };

    const frMeta = await buildNewsListingMetadata(frRoute);
    const enMeta = await buildNewsListingMetadata(enRoute);

    expect(frMeta.title).toBe("Actualités — IGM");
    expect(enMeta.title).toBe("News — IGM");
    expect(frMeta.alternates?.canonical).toContain("/actualites");
    expect(enMeta.alternates?.canonical).toContain("/en/news");
  });
});

describe("buildReportMetadata", () => {
  it("builds FR and EN report metadata from messages", async () => {
    const frMeta = await buildReportMetadata({
      kind: "report",
      ...buildMatchContext(["denoncer"]),
    });
    const enMeta = await buildReportMetadata({
      kind: "report",
      ...buildMatchContext(["en", "report"]),
    });

    expect(frMeta.title).toContain("Signalement");
    expect(frMeta.alternates?.canonical).toContain("/denoncer");
    expect(enMeta.title).toMatch(/Report/i);
    expect(enMeta.alternates?.canonical).toContain("/en/report");
  });
});

describe("buildHomeMetadata", () => {
  it("falls back to default title when CMS has no SEO fields", async () => {
    const metadata = await buildHomeMetadata({
      kind: "home",
      ...buildMatchContext([]),
    });

    expect(metadata.title).toBe("IGM — Inspection Générale des Mines");
    expect(metadata.alternates?.canonical).toMatch(/localhost:3000\/?$/);
  });

  it("uses home SEO fields from CMS when present", async () => {
    vi.mocked(getHome).mockResolvedValue({
      seoTitle: "Accueil personnalisé",
      seoDescription: "Description accueil.",
    } as never);

    const metadata = await buildHomeMetadata({
      kind: "home",
      ...buildMatchContext([]),
    });

    expect(metadata.title).toBe("Accueil personnalisé");
    expect(metadata.description).toBe("Description accueil.");
  });
});

describe("buildPlaceholderMetadata", () => {
  it("returns under-construction metadata for unknown routes", async () => {
    const metadata = await buildPlaceholderMetadata({
      kind: "under-construction",
      ...buildMatchContext(["page-inconnue"]),
    });

    expect(metadata.title).toBeTruthy();
    expect(metadata.alternates?.canonical).toContain("/page-inconnue");
  });
});
