import type { Payload } from "payload";

import { SIGNALEMENT_ORPHAN_MAX_AGE_MS } from "./constants";

export async function assertOrphanSignalementPieces(
  payload: Payload,
  pieceIds: number[],
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!pieceIds.length) {
    return { ok: true };
  }

  const uniqueIds = [...new Set(pieceIds)];
  if (uniqueIds.length !== pieceIds.length) {
    return { ok: false, error: "Pièces jointes invalides." };
  }

  const files = await payload.find({
    collection: "signalement-files",
    where: { id: { in: uniqueIds } },
    limit: uniqueIds.length,
    depth: 0,
    overrideAccess: true,
  });

  if (files.docs.length !== uniqueIds.length) {
    return { ok: false, error: "Une ou plusieurs pièces jointes sont introuvables." };
  }

  const cutoff = Date.now() - SIGNALEMENT_ORPHAN_MAX_AGE_MS;
  for (const doc of files.docs) {
    const createdAt = doc.createdAt ? new Date(doc.createdAt).getTime() : 0;
    if (!createdAt || createdAt < cutoff) {
      return { ok: false, error: "Une pièce jointe a expiré. Réimportez vos fichiers." };
    }
  }

  const linked = await payload.find({
    collection: "signalements",
    where: { pieces: { in: uniqueIds } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  });

  if (linked.docs.length > 0) {
    return { ok: false, error: "Pièces jointes déjà utilisées." };
  }

  return { ok: true };
}
