import { describe, expect, it } from "vitest";

import { formatNewsDate, formatNewsDateLong } from "../formatNewsDate";

describe("formatNewsDate", () => {
  it("formats dates deterministically in FR and EN", () => {
    expect(formatNewsDate("2026-06-02T12:00:00.000Z", "fr")).toBe("2 juin 2026");
    expect(formatNewsDate("2026-06-02T12:00:00.000Z", "en")).toBe("2 Jun 2026");
  });

  it("formats long dates deterministically", () => {
    expect(formatNewsDateLong("2026-06-02T12:00:00.000Z", "fr")).toBe("2 juin 2026");
    expect(formatNewsDateLong("2026-06-02T12:00:00.000Z", "en")).toBe("June 2, 2026");
  });
});
