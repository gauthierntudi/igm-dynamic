import { describe, expect, it } from "vitest";

import { isPublishedHomePage, isSiteHomePathname, pageSlugFromSegments } from "../pathUtils";

describe("isPublishedHomePage", () => {
  it("matches root and marketing-agency", () => {
    expect(isPublishedHomePage([])).toBe(true);
    expect(isPublishedHomePage(["marketing-agency"])).toBe(true);
  });

  it("rejects other paths", () => {
    expect(isPublishedHomePage(["actualites"])).toBe(false);
    expect(isPublishedHomePage(["en"])).toBe(false);
    expect(isPublishedHomePage(["photos", "album-slug"])).toBe(false);
  });
});

describe("isSiteHomePathname", () => {
  it("matches FR and EN home URLs", () => {
    expect(isSiteHomePathname("/")).toBe(true);
    expect(isSiteHomePathname("/marketing-agency")).toBe(true);
    expect(isSiteHomePathname("/en")).toBe(true);
    expect(isSiteHomePathname("/en/marketing-agency")).toBe(true);
  });

  it("rejects interior pages", () => {
    expect(isSiteHomePathname("/contact")).toBe(false);
    expect(isSiteHomePathname("/denoncer")).toBe(false);
    expect(isSiteHomePathname("/en/report")).toBe(false);
    expect(isSiteHomePathname("/en/about")).toBe(false);
  });
});

describe("pageSlugFromSegments", () => {
  it("joins segments with slashes", () => {
    expect(pageSlugFromSegments(["ordonnances"])).toBe("ordonnances");
    expect(pageSlugFromSegments(["photos", "my-album"])).toBe("photos/my-album");
  });
});
