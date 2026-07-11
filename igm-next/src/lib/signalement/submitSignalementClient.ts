import { withDeployedBase } from "@/lib/deployBasePath";
import type { SupportedLocale } from "@/i18n/locales";
import { TURNSTILE_FORM_FIELD } from "@/lib/security/turnstile";
import { getSignalementFormCopy, formatSignalementUploadProgressLabel } from "@/lib/signalement/signalementFormCopy";

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
  locale: SupportedLocale;
};

export type UploadProgress = {
  phase: "files" | "final";
  fileIndex: number;
  fileTotal: number;
  filePercent: number;
  uploadAttempt?: number;
  maxUploadAttempts?: number;
};

export function computeSignalementUploadOverallPercent(
  progress: UploadProgress | null,
  fileCount: number,
): number {
  if (!progress) {
    return 3;
  }

  if (fileCount <= 0) {
    return Math.min(100, Math.max(5, Math.round(progress.filePercent)));
  }

  const totalSteps = fileCount + 1;
  const stepWeight = 100 / totalSteps;

  if (progress.phase === "final") {
    const base = fileCount * stepWeight;
    return Math.min(100, Math.round(base + (progress.filePercent / 100) * stepWeight));
  }

  const base = (progress.fileIndex - 1) * stepWeight;
  return Math.min(99, Math.round(base + (progress.filePercent / 100) * stepWeight));
}


export { formatSignalementUploadProgressLabel } from "@/lib/signalement/signalementFormCopy";

type JsonResult = { ok?: boolean; error?: string; message?: string; id?: number };

function parseJsonResponse(xhr: XMLHttpRequest): JsonResult {
  try {
    return JSON.parse(xhr.responseText) as JsonResult;
  } catch {
    return {};
  }
}

function submitMetadataWithProgress(
  fields: SignalementSubmitFields,
  pieceIds: number[],
  onProgress: (percent: number) => void,
): Promise<{ message?: string }> {
  const t = getSignalementFormCopy(fields.locale).toast;
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
      reject(new Error(data.error || t.uploadFailed));
    };

    xhr.onerror = () => reject(new Error(getSignalementFormCopy(fields.locale).error.network));
    xhr.onabort = () => reject(new Error(t.uploadCancelled));

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
    fd.set("locale", fields.locale);
    if (fields.turnstileToken) {
      fd.set(TURNSTILE_FORM_FIELD, fields.turnstileToken);
    }
    pieceIds.forEach((id) => fd.append("piece_ids", String(id)));

    xhr.send(fd);
  });
}

async function prepareUploadFiles(files: File[], locale: SupportedLocale): Promise<File[]> {
  const t = getSignalementFormCopy(locale).toast;
  const prepared = await Promise.all(files.map((file) => prepareSignalementUploadFile(file)));

  let totalSize = 0;
  for (const file of prepared) {
    const maxBytes = maxSignalementFileBytes(file.type, file.name);
    if (file.size > maxBytes) {
      const limitMb = Math.round(maxBytes / (1024 * 1024));
      throw new Error(t.fileTooLargeAfterCompression(limitMb));
    }
    totalSize += file.size;
  }

  if (totalSize > MAX_SIGNALEMENT_TOTAL_BYTES) {
    throw new Error(t.attachmentsTooHeavy);
  }

  return prepared;
}

export async function submitSignalementWithProgress(
  files: File[],
  fields: SignalementSubmitFields,
  onProgress: (progress: UploadProgress) => void,
): Promise<{ message?: string }> {
  const t = getSignalementFormCopy(fields.locale).toast;
  if (files.length > MAX_SIGNALEMENT_FILES) {
    throw new Error(t.maxFilesServer(MAX_SIGNALEMENT_FILES));
  }

  const preparedFiles = await prepareUploadFiles(files, fields.locale);
  const pieceIds: number[] = [];

  for (let index = 0; index < preparedFiles.length; index += 1) {
    const file = preparedFiles[index]!;

    const id = await uploadSignalementPieceWithProgress(
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
