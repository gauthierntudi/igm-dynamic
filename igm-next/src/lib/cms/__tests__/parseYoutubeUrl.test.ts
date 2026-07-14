import { describe, expect, it } from "vitest";

import {
  parseYoutubeVideoId,
  youtubeEmbedSrc,
  youtubePosterSrc,
} from "../media-gallery/parseYoutubeUrl";

describe("parseYoutubeVideoId", () => {
  it("accepte un ID brut", () => {
    expect(parseYoutubeVideoId("dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
  });

  it("parse watch, youtu.be, embed et shorts", () => {
    expect(parseYoutubeVideoId("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe(
      "dQw4w9WgXcQ",
    );
    expect(parseYoutubeVideoId("https://youtu.be/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
    expect(parseYoutubeVideoId("https://www.youtube.com/embed/dQw4w9WgXcQ")).toBe(
      "dQw4w9WgXcQ",
    );
    expect(parseYoutubeVideoId("https://www.youtube.com/shorts/dQw4w9WgXcQ")).toBe(
      "dQw4w9WgXcQ",
    );
  });

  it("rejette une URL invalide", () => {
    expect(parseYoutubeVideoId("https://example.com/video")).toBeNull();
    expect(parseYoutubeVideoId("")).toBeNull();
  });
});

describe("youtube helpers", () => {
  it("construit embed et poster", () => {
    expect(youtubeEmbedSrc("dQw4w9WgXcQ", { autoplay: true })).toContain(
      "youtube-nocookie.com/embed/dQw4w9WgXcQ",
    );
    expect(youtubeEmbedSrc("dQw4w9WgXcQ", { autoplay: true })).toContain("autoplay=1");
    expect(youtubePosterSrc("dQw4w9WgXcQ")).toBe(
      "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
    );
  });
});
