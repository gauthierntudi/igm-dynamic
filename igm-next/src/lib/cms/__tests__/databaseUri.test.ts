import { describe, expect, it } from "vitest";

import { normalizePostgresConnectionString } from "../databaseUri";

describe("normalizePostgresConnectionString", () => {
  it("remplace sslmode=require par verify-full", () => {
    expect(
      normalizePostgresConnectionString(
        "postgresql://user:pass@ep-xxx.neon.tech/igm?sslmode=require",
      ),
    ).toBe("postgresql://user:pass@ep-xxx.neon.tech/igm?sslmode=verify-full");
  });

  it("laisse verify-full inchangé", () => {
    const uri = "postgresql://user:pass@ep-xxx.neon.tech/igm?sslmode=verify-full";
    expect(normalizePostgresConnectionString(uri)).toBe(uri);
  });
});
