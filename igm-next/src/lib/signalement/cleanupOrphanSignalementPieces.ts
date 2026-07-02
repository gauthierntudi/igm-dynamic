import type { Payload } from "payload";

import { SIGNALEMENT_ORPHAN_MAX_AGE_MS } from "./constants";
import { cleanupOrphanSignalementS3Objects } from "./cleanupOrphanSignalementS3Objects";
import {
  collectLinkedSignalementPieceIds,
  selectOrphanSignalementPieceIds,
} from "./orphanSignalementPieceIds";

export type CleanupOrphanSignalementPiecesResult = {
  scanned: number;
  deleted: number;
  failed: number;
  s3Scanned: number;
  s3Deleted: number;
  s3Failed: number;
};

const DEFAULT_BATCH_SIZE = 50;
const DEFAULT_MAX_DELETES = 200;

export async function cleanupOrphanSignalementPieces(
  payload: Payload,
  options: { batchSize?: number; maxDeletes?: number } = {},
): Promise<CleanupOrphanSignalementPiecesResult> {
  const batchSize = options.batchSize ?? DEFAULT_BATCH_SIZE;
  const maxDeletes = options.maxDeletes ?? DEFAULT_MAX_DELETES;
  const cutoff = new Date(Date.now() - SIGNALEMENT_ORPHAN_MAX_AGE_MS).toISOString();

  let scanned = 0;
  let deleted = 0;
  let failed = 0;
  let page = 1;

  while (deleted + failed < maxDeletes) {
    const candidates = await payload.find({
      collection: "signalement-files",
      where: { createdAt: { less_than: cutoff } },
      limit: batchSize,
      page,
      depth: 0,
      overrideAccess: true,
    });

    if (!candidates.docs.length) {
      break;
    }

    const candidateIds = candidates.docs.map((doc) => doc.id);
    scanned += candidateIds.length;

    const linkedSignalements = await payload.find({
      collection: "signalements",
      where: { pieces: { in: candidateIds } },
      limit: candidateIds.length,
      depth: 0,
      overrideAccess: true,
    });

    const linkedIds = collectLinkedSignalementPieceIds(linkedSignalements.docs);
    const orphanIds = selectOrphanSignalementPieceIds(candidateIds, linkedIds);

    if (!orphanIds.length) {
      if (!candidates.hasNextPage) {
        break;
      }
      page += 1;
      continue;
    }

    for (const id of orphanIds) {
      if (deleted + failed >= maxDeletes) {
        break;
      }

      try {
        await payload.delete({
          collection: "signalement-files",
          id,
          overrideAccess: true,
        });
        deleted += 1;
      } catch (error) {
        console.error("[signalement] orphan cleanup delete failed", id, error);
        failed += 1;
      }
    }

    // Après suppression, la page 1 se remplit — on la re-scanne avant d’avancer.
    page = 1;
  }

  const s3Result = await cleanupOrphanSignalementS3Objects(payload, { maxDeletes });

  return {
    scanned,
    deleted,
    failed,
    s3Scanned: s3Result.scanned,
    s3Deleted: s3Result.deleted,
    s3Failed: s3Result.failed,
  };
}
