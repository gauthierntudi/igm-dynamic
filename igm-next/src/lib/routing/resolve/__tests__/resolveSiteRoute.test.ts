import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/cms/client", () => ({
  getNewsBySlug: vi.fn(),
}));

vi.mock("@/lib/cms/getPageContent", () => ({
  getPageContent: vi.fn(),
}));

import { getNewsBySlug } from "@/lib/cms/client";
import { getPageContent } from "@/lib/cms/getPageContent";

import { resolveSiteRoute } from "../resolveSiteRoute";

const mockArticle = {
  id: "1",
  slug: "test-article",
  title: "Test",
  publishedAt: "2026-01-01T00:00:00.000Z",
};

beforeEach(() => {
  vi.mocked(getNewsBySlug).mockReset();
  vi.mocked(getPageContent).mockReset();
  vi.mocked(getPageContent).mockResolvedValue(null);
});

describe("resolveSiteRoute", () => {
  it("resolves home and news listing", async () => {
    await expect(resolveSiteRoute({ segments: [] })).resolves.toMatchObject({ kind: "home" });
    await expect(resolveSiteRoute({ segments: ["actualites"], page: "2", q: " mines " })).resolves.toMatchObject({
      kind: "news-listing",
      page: 2,
      q: "mines",
    });
  });

  it("resolves news article when CMS returns a document", async () => {
    vi.mocked(getNewsBySlug).mockResolvedValue(mockArticle as never);
    const route = await resolveSiteRoute({ segments: ["actualites", "test-article"] });
    expect(route).toMatchObject({ kind: "news-article", article: mockArticle });
  });

  it("falls through when news article slug is unknown", async () => {
    vi.mocked(getNewsBySlug).mockResolvedValue(null);
    const route = await resolveSiteRoute({ segments: ["actualites", "missing-slug"] });
    expect(route.kind).not.toBe("news-article");
    expect(route).toMatchObject({ kind: "under-construction" });
  });

  it("resolves EN locale paths", async () => {
    await expect(resolveSiteRoute({ segments: ["en", "news"] })).resolves.toMatchObject({
      kind: "news-listing",
      locale: "en",
    });
  });

  it("ends on under-construction for unknown paths", async () => {
    const route = await resolveSiteRoute({ segments: ["does-not-exist"] });
    expect(route).toMatchObject({ kind: "under-construction", slug: "does-not-exist" });
  });

  it("resolves cms page before placeholder", async () => {
    vi.mocked(getPageContent).mockResolvedValue({
      id: "page-1",
      slug: "vision",
      title: "Vision",
    } as never);

    const route = await resolveSiteRoute({ segments: ["vision"] });
    expect(route).toMatchObject({ kind: "cms-page", routeKey: "vision" });
  });

  it("treats removed /audios as under-construction", async () => {
    const route = await resolveSiteRoute({ segments: ["audios"] });
    expect(route).toMatchObject({ kind: "under-construction", slug: "audios" });
  });
});
