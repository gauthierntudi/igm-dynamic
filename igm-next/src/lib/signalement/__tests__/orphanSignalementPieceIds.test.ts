import { describe, expect, it } from "vitest";

import {
  collectLinkedSignalementPieceIds,
  selectOrphanSignalementPieceIds,
} from "../orphanSignalementPieceIds";

describe("orphanSignalementPieceIds", () => {
  it("collects numeric and populated relationship ids", () => {
    const linked = collectLinkedSignalementPieceIds([
      { pieces: [1, { id: 2 }, 3] },
      { pieces: [{ id: 4 }] },
      { pieces: undefined },
    ]);

    expect([...linked].sort((a, b) => a - b)).toEqual([1, 2, 3, 4]);
  });

  it("returns candidate ids not linked to a signalement", () => {
    const linked = new Set([2, 5]);
    expect(selectOrphanSignalementPieceIds([1, 2, 3, 5, 6], linked)).toEqual([1, 3, 6]);
  });
});
