import { describe, expect, it } from "vitest";

import { isPublishedHomePage, pageSlugFromSegments } from "../pathUtils";

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

describe("pageSlugFromSegments", () => {
  it("joins segments with slashes", () => {
    expect(pageSlugFromSegments(["ordonnances"])).toBe("ordonnances");
    expect(pageSlugFromSegments(["photos", "my-album"])).toBe("photos/my-album");
  });
});
