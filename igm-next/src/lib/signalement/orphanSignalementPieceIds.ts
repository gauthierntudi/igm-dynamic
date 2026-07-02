type SignalementWithPieces = {
  pieces?: unknown;
};

export function collectLinkedSignalementPieceIds(
  signalements: SignalementWithPieces[],
): Set<number> {
  const linkedIds = new Set<number>();

  for (const signalement of signalements) {
    const pieces = signalement.pieces;
    if (!Array.isArray(pieces)) {
      continue;
    }

    for (const piece of pieces) {
      if (typeof piece === "number") {
        linkedIds.add(piece);
        continue;
      }

      if (
        typeof piece === "object" &&
        piece !== null &&
        "id" in piece &&
        typeof piece.id === "number"
      ) {
        linkedIds.add(piece.id);
      }
    }
  }

  return linkedIds;
}

export function selectOrphanSignalementPieceIds(
  candidateIds: number[],
  linkedIds: ReadonlySet<number>,
): number[] {
  return candidateIds.filter((id) => !linkedIds.has(id));
}
