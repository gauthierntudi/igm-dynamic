import {
  isAllowedSignalementMime,
  MAX_SIGNALEMENT_FILE_BYTES,
  maxSignalementFileBytes,
} from "./constants";

export type ValidateSignalementFileResult =
  | { ok: true }
  | { ok: false; error: string };

type FileLike = {
  size: number;
  type: string;
  name: string;
};

export function validateSignalementFile(file: FileLike): ValidateSignalementFileResult {
  const mime = file.type || "application/octet-stream";
  const maxBytes = maxSignalementFileBytes(mime, file.name);

  if (file.size > maxBytes) {
    const limitLabel = maxBytes > MAX_SIGNALEMENT_FILE_BYTES ? "20 Mo" : "5 Mo";
    return { ok: false, error: `Fichier trop lourd (max ${limitLabel}).` };
  }

  if (!isAllowedSignalementMime(mime, file.name)) {
    return { ok: false, error: "Type de fichier non autorisé." };
  }

  return { ok: true };
}
