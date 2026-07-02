import { withDeployedBase } from "@/lib/deployBasePath";
import { TURNSTILE_FORM_FIELD } from "@/lib/security/turnstile";

import { prepareSignalementUploadFile } from "./compressSignalementImage";
import { MAX_SIGNALEMENT_FILES, MAX_SIGNALEMENT_TOTAL_BYTES, maxSignalementFileBytes } from "./constants";
import { uploadSignalementPieceWithProgress } from "./uploadSignalementPieceClient";

export type SignalementSubmitFields = {
  description: string;
  anonymousMode: boolean;
  nom: string;
  email: string;
  tel: string;
  province: string;
  villeSite: string;
  coords: string;
  typeInfraction: string;
  turnstileToken: string | null;
};

export type UploadProgress = {
  phase: "files" | "final";
  fileIndex: number;
  fileTotal: number;
  filePercent: number;
  uploadAttempt?: number;
  maxUploadAttempts?: number;
};

export function formatSignalementUploadProgressLabel(progress: UploadProgress): string {
  if (progress.phase === "final") {
    return "Finalisation du signalement…";
  }

  if (
    progress.uploadAttempt &&
    progress.uploadAttempt > 1 &&
    progress.maxUploadAttempts
  ) {
    return `Nouvelle tentative (${progress.uploadAttempt}/${progress.maxUploadAttempts})…`;
  }

  return `Envoi du fichier ${progress.fileIndex} / ${progress.fileTotal}`;
}

const MAX_UPLOAD_ATTEMPTS = 3;
const RETRY_BASE_DELAY_MS = 800;

type JsonResult = { ok?: boolean; error?: string; message?: string; id?: number };

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function parseJsonResponse(xhr: XMLHttpRequest): JsonResult {
  try {
    return JSON.parse(xhr.responseText) as JsonResult;
  } catch {
    return {};
  }
}

function uploadPieceWithProgress(
  file: File,
  onProgress: (percent: number) => void,
): Promise<number> {
  return uploadSignalementPieceWithProgress(file, onProgress);
}

async function uploadPieceWithRetry(
  file: File,
  onProgress: (percent: number) => void,
  onAttempt: (attempt: number, maxAttempts: number) => void,
): Promise<number> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_UPLOAD_ATTEMPTS; attempt += 1) {
    onAttempt(attempt, MAX_UPLOAD_ATTEMPTS);
    try {
      return await uploadPieceWithProgress(file, onProgress);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error("Échec de l’envoi du fichier.");
      if (attempt < MAX_UPLOAD_ATTEMPTS) {
        await sleep(RETRY_BASE_DELAY_MS * attempt);
      }
    }
  }

  throw lastError ?? new Error("Échec de l’envoi du fichier.");
}

function submitMetadataWithProgress(
  fields: SignalementSubmitFields,
  pieceIds: number[],
  onProgress: (percent: number) => void,
): Promise<{ message?: string }> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", withDeployedBase("/api/signalement"));
    xhr.responseType = "text";

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) {
        onProgress(100);
        return;
      }
      const percent = Math.min(100, Math.round((event.loaded / event.total) * 100));
      onProgress(percent);
    };

    xhr.onload = () => {
      const data = parseJsonResponse(xhr);
      if (xhr.status >= 200 && xhr.status < 300 && data.ok) {
        resolve({ message: data.message });
        return;
      }
      reject(new Error(data.error || "Échec de l’envoi."));
    };

    xhr.onerror = () => reject(new Error("Erreur réseau."));
    xhr.onabort = () => reject(new Error("Envoi annulé."));

    const fd = new FormData();
    fd.set("description", fields.description);
    if (!fields.anonymousMode) {
      fd.set("alerteur_nom", fields.nom.trim());
      const emailTrimmed = fields.email.trim();
      const telTrimmed = fields.tel.trim();
      if (emailTrimmed) fd.set("alerteur_email", emailTrimmed);
      if (telTrimmed) fd.set("alerteur_tel", telTrimmed);
    }
    fd.set("province", fields.province);
    fd.set("ville_site", fields.villeSite.trim());
    fd.set("coords", fields.coords.trim());
    fd.set("type_infraction", fields.typeInfraction);
    if (fields.turnstileToken) {
      fd.set(TURNSTILE_FORM_FIELD, fields.turnstileToken);
    }
    pieceIds.forEach((id) => fd.append("piece_ids", String(id)));

    xhr.send(fd);
  });
}

async function prepareUploadFiles(files: File[]): Promise<File[]> {
  const prepared = await Promise.all(files.map((file) => prepareSignalementUploadFile(file)));

  let totalSize = 0;
  for (const file of prepared) {
    const maxBytes = maxSignalementFileBytes(file.type, file.name);
    if (file.size > maxBytes) {
      const limitMb = Math.round(maxBytes / (1024 * 1024));
      throw new Error(`Après compression, un fichier dépasse ${limitMb} Mo.`);
    }
    totalSize += file.size;
  }

  if (totalSize > MAX_SIGNALEMENT_TOTAL_BYTES) {
    throw new Error("Pièces jointes trop lourdes.");
  }

  return prepared;
}

export async function submitSignalementWithProgress(
  files: File[],
  fields: SignalementSubmitFields,
  onProgress: (progress: UploadProgress) => void,
): Promise<{ message?: string }> {
  if (files.length > MAX_SIGNALEMENT_FILES) {
    throw new Error(`Maximum ${MAX_SIGNALEMENT_FILES} fichiers.`);
  }

  const preparedFiles = await prepareUploadFiles(files);
  const pieceIds: number[] = [];

  for (let index = 0; index < preparedFiles.length; index += 1) {
    const file = preparedFiles[index]!;

    const id = await uploadPieceWithRetry(
      file,
      (filePercent) => {
        onProgress({
          phase: "files",
          fileIndex: index + 1,
          fileTotal: preparedFiles.length,
          filePercent,
        });
      },
      (uploadAttempt, maxUploadAttempts) => {
        onProgress({
          phase: "files",
          fileIndex: index + 1,
          fileTotal: preparedFiles.length,
          filePercent: 0,
          uploadAttempt,
          maxUploadAttempts,
        });
      },
    );
    pieceIds.push(id);
  }

  onProgress({
    phase: "final",
    fileIndex: preparedFiles.length,
    fileTotal: preparedFiles.length,
    filePercent: 0,
  });

  return submitMetadataWithProgress(fields, pieceIds, (filePercent) => {
    onProgress({
      phase: "final",
      fileIndex: preparedFiles.length,
      fileTotal: preparedFiles.length,
      filePercent,
    });
  });
}
