import { describe, expect, it } from "vitest";

import {
  defaultTimelineSegmentColor,
  normalizeHexColor,
  resolveTimelineMilestoneColors,
  timelineTextColorForBackground,
} from "../timelineColors";

describe("normalizeHexColor", () => {
  it("accepts 6-digit hex with or without hash", () => {
    expect(normalizeHexColor("#1b4491")).toBe("#1b4491");
    expect(normalizeHexColor("1B4491")).toBe("#1b4491");
  });

  it("expands 3-digit shorthand", () => {
    expect(normalizeHexColor("#f6b")).toBe("#ff66bb");
  });
});

describe("resolveTimelineMilestoneColors", () => {
  it("uses palette defaults when colors are missing", () => {
    expect(resolveTimelineMilestoneColors(0, 3)).toEqual({
      segmentColor: "#0c1f3d",
      segmentTextColor: "#ffffff",
    });
    expect(resolveTimelineMilestoneColors(2, 3).segmentColor).toBe("#f6bf0d");
  });

  it("keeps custom segment and bubble colors separate", () => {
    const colors = resolveTimelineMilestoneColors(1, 3, "#153a7a", "#ffffff");
    expect(colors.segmentColor).toBe("#153a7a");
    expect(colors.bubbleColor).toBe("#ffffff");
    expect(colors.bubbleTextColor).toBe("#0c1f3d");
  });
});

describe("timelineTextColorForBackground", () => {
  it("picks dark text on gold backgrounds", () => {
    expect(timelineTextColorForBackground("#f6bf0d")).toBe("#0c1f3d");
    expect(timelineTextColorForBackground("#0c1f3d")).toBe("#ffffff");
  });
});

describe("defaultTimelineSegmentColor", () => {
  it("uses gold for the last milestone", () => {
    expect(defaultTimelineSegmentColor(2, 3)).toBe("#f6bf0d");
  });
});
