import { describe, expect, it } from "vitest";

import { sortMediaGalleryVideosByDisplayOrder } from "../getMediaGalleryItems";
import type { CmsMediaGalleryItem } from "../types";

function item(
  partial: Pick<CmsMediaGalleryItem, "id" | "order" | "publishedAt"> & {
    title?: string;
  },
): CmsMediaGalleryItem {
  return {
    title: partial.title ?? `Video ${partial.id}`,
    youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    ...partial,
  };
}

describe("sortMediaGalleryVideosByDisplayOrder", () => {
  it("trie 1, 2, 3 même si les dates disent le contraire", () => {
    const sorted = sortMediaGalleryVideosByDisplayOrder([
      item({ id: 1, order: 3, publishedAt: "2026-07-15T12:00:00.000Z", title: "C" }),
      item({ id: 2, order: 1, publishedAt: "2026-07-10T12:00:00.000Z", title: "A" }),
      item({ id: 3, order: 2, publishedAt: "2026-07-20T12:00:00.000Z", title: "B" }),
    ]);

    expect(sorted.map((v) => v.title)).toEqual(["A", "B", "C"]);
  });

  it("accepte order en string (numeric Postgres)", () => {
    const sorted = sortMediaGalleryVideosByDisplayOrder([
      { ...item({ id: 1, order: 0, publishedAt: null }), order: "2" as unknown as number },
      { ...item({ id: 2, order: 0, publishedAt: null }), order: "1" as unknown as number },
    ]);

    expect(sorted.map((v) => v.id)).toEqual([2, 1]);
  });
});
