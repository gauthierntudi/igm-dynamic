import type { File as PayloadUploadFile } from "payload";

import { getPayloadClient } from "@/lib/cms/payload";

import { validateSignalementFile } from "./validateSignalementFile";

export type UploadSignalementPieceResult =
  | { ok: true; id: number }
  | { ok: false; error: string; status: number };

async function fileToPayloadUpload(file: File): Promise<PayloadUploadFile> {
  const buffer = Buffer.from(await file.arrayBuffer());
  return {
    data: buffer,
    mimetype: file.type || "application/octet-stream",
    name: file.name,
    size: file.size,
  };
}

export async function uploadSignalementPiece(file: File): Promise<UploadSignalementPieceResult> {
  if (!(file instanceof File) || file.size <= 0) {
    return { ok: false, error: "Fichier invalide.", status: 400 };
  }

  const validation = validateSignalementFile(file);
  if (!validation.ok) {
    return { ok: false, error: validation.error, status: 400 };
  }

  try {
    const payload = await getPayloadClient();
    const created = await payload.create({
      collection: "signalement-files",
      data: {},
      file: await fileToPayloadUpload(file),
      overrideAccess: true,
    });

    return { ok: true, id: created.id };
  } catch (error) {
    console.error("[signalement] piece upload failed", error);
    return {
      ok: false,
      error: "Impossible d’enregistrer le fichier. Réessayez.",
      status: 500,
    };
  }
}
