import { describe, expect, it } from "vitest";

import { buildMatchContext } from "../../buildContext";
import { matchHomeRoute } from "../home";
import { matchPhotoRoutes } from "../photos";
import { matchStaticRoutes } from "../staticRoutes";
import { matchWhoWeAreRoutes } from "../whoWeAre";

describe("matchHomeRoute", () => {
  it("matches home paths", () => {
    const ctx = buildMatchContext([]);
    expect(matchHomeRoute(ctx, { segments: [] })).toEqual({ kind: "home", ...ctx });
  });

  it("ignores non-home paths", () => {
    const ctx = buildMatchContext(["actualites"]);
    expect(matchHomeRoute(ctx, { segments: ["actualites"] })).toBeNull();
  });
});

describe("matchWhoWeAreRoutes", () => {
  it("matches history and mission sections", () => {
    const historyCtx = buildMatchContext(["historique"]);
    expect(matchWhoWeAreRoutes(historyCtx, { segments: ["historique"] })).toEqual({
      kind: "who-we-are-history",
      ...historyCtx,
    });

    const missionCtx = buildMatchContext(["mission"]);
    expect(matchWhoWeAreRoutes(missionCtx, { segments: ["mission"] })).toEqual({
      kind: "who-we-are-section",
      section: "mission",
      ...missionCtx,
    });
  });
});

describe("matchPhotoRoutes", () => {
  it("matches album detail and listing", () => {
    const albumCtx = buildMatchContext(["photos", "ceremony-2024"]);
    expect(matchPhotoRoutes(albumCtx, { segments: ["photos", "ceremony-2024"] })).toEqual({
      kind: "photo-album",
      albumSlug: "ceremony-2024",
      ...albumCtx,
    });

    const listingCtx = buildMatchContext(["photos"]);
    expect(matchPhotoRoutes(listingCtx, { segments: ["photos"] })).toEqual({
      kind: "photos-listing",
      ...listingCtx,
    });
  });
});

describe("matchStaticRoutes", () => {
  it("matches fixed feature routes", () => {
    const reportCtx = buildMatchContext(["denoncer"]);
    expect(matchStaticRoutes(reportCtx, { segments: ["denoncer"] })).toEqual({
      kind: "report",
      ...reportCtx,
    });

    const legislationCtx = buildMatchContext(["ordonnances"]);
    expect(matchStaticRoutes(legislationCtx, { segments: ["ordonnances"] })).toEqual({
      kind: "legislation",
      category: "ordinances",
      ...legislationCtx,
    });

    const videosCtx = buildMatchContext(["videos"]);
    expect(matchStaticRoutes(videosCtx, { segments: ["videos"] })).toEqual({
      kind: "videos",
      ...videosCtx,
    });
  });

  it("does not match removed audios route", () => {
    const ctx = buildMatchContext(["audios"]);
    expect(matchStaticRoutes(ctx, { segments: ["audios"] })).toBeNull();
  });
});
