import { withDeployedBase } from "@/lib/deployBasePath";
import { isSignalementS3DirectUploadEnabledClient } from "@/lib/signalement/signalementS3DirectUpload";

const MAX_ATTEMPTS = 3;
const RETRY_BASE_DELAY_MS = 800;

/** En-têtes interdits manuellement par XMLHttpRequest (le navigateur les gère). */
const FORBIDDEN_REQUEST_HEADERS = new Set([
  "content-length",
  "connection",
  "host",
  "origin",
  "referer",
]);

type PresignResponse = {
  ok?: boolean;
  error?: string;
  uploadUrl?: string;
  completeToken?: string;
  headers?: Record<string, string>;
};

type CompleteResponse = {
  ok?: boolean;
  error?: string;
  id?: number;
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function parseJson<T>(xhr: XMLHttpRequest): T {
  try {
    return JSON.parse(xhr.responseText) as T;
  } catch {
    return {} as T;
  }
}

function postJson<T>(url: string, body: unknown): Promise<T> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.responseType = "text";

    xhr.onload = () => {
      const data = parseJson<T>(xhr);
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(data);
        return;
      }
      const err = (data as { error?: string }).error || "Échec de l’envoi du fichier.";
      reject(new Error(err));
    };

    xhr.onerror = () => reject(new Error("Erreur réseau lors de l’envoi du fichier."));
    xhr.onabort = () => reject(new Error("Envoi annulé."));
    xhr.send(JSON.stringify(body));
  });
}

function putFileToS3WithProgress(
  uploadUrl: string,
  file: File,
  headers: Record<string, string>,
  onProgress: (percent: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", uploadUrl);
    xhr.responseType = "text";

    Object.entries(headers).forEach(([key, value]) => {
      if (FORBIDDEN_REQUEST_HEADERS.has(key.toLowerCase())) {
        return;
      }
      xhr.setRequestHeader(key, value);
    });

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) return;
      const percent = Math.min(100, Math.round((event.loaded / event.total) * 100));
      onProgress(percent);
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
        return;
      }
      reject(new Error("Échec de l’envoi vers le stockage."));
    };

    xhr.onerror = () => reject(new Error("Erreur réseau lors de l’envoi du fichier."));
    xhr.onabort = () => reject(new Error("Envoi annulé."));
    xhr.send(file);
  });
}

export async function uploadSignalementPieceWithProgress(
  file: File,
  onProgress: (percent: number) => void,
  onAttempt?: (attempt: number, maxAttempts: number) => void,
): Promise<number> {
  if (!isSignalementS3DirectUploadEnabledClient()) {
    return uploadWithRetry(
      () => uploadSignalementPieceViaServer(file, onProgress),
      onAttempt,
    );
  }

  try {
    return await uploadSignalementPieceViaS3Presign(file, onProgress, onAttempt);
  } catch (error) {
    if (error instanceof Error && error.message.includes("indisponible")) {
      return uploadWithRetry(
        () => uploadSignalementPieceViaServer(file, onProgress),
        onAttempt,
      );
    }
    throw error;
  }
}

async function uploadWithRetry(
  upload: () => Promise<number>,
  onAttempt?: (attempt: number, maxAttempts: number) => void,
): Promise<number> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    onAttempt?.(attempt, MAX_ATTEMPTS);
    try {
      return await upload();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error("Échec de l’envoi du fichier.");
      if (attempt < MAX_ATTEMPTS) {
        await sleep(RETRY_BASE_DELAY_MS * attempt);
      }
    }
  }

  throw lastError ?? new Error("Échec de l’envoi du fichier.");
}

async function uploadSignalementPieceViaS3Presign(
  file: File,
  onProgress: (percent: number) => void,
  onAttempt?: (attempt: number, maxAttempts: number) => void,
): Promise<number> {
  let presign: PresignResponse | null = null;
  let lastPutError: Error | null = null;

  for (let putAttempt = 1; putAttempt <= MAX_ATTEMPTS; putAttempt += 1) {
    onAttempt?.(putAttempt, MAX_ATTEMPTS);
    try {
      presign = await postJson<PresignResponse>(
        withDeployedBase("/api/signalement/piece/presign"),
        {
          filename: file.name,
          mimeType: file.type || "application/octet-stream",
          filesize: file.size,
        },
      );

      if (!presign.ok || !presign.uploadUrl || !presign.completeToken || !presign.headers) {
        throw new Error(presign.error || "Impossible de préparer l’envoi.");
      }

      await putFileToS3WithProgress(presign.uploadUrl, file, presign.headers, onProgress);
      lastPutError = null;
      break;
    } catch (error) {
      lastPutError = error instanceof Error ? error : new Error("Échec de l’envoi du fichier.");
      presign = null;
      if (putAttempt < MAX_ATTEMPTS) {
        await sleep(RETRY_BASE_DELAY_MS * putAttempt);
      }
    }
  }

  if (lastPutError || !presign?.completeToken) {
    throw lastPutError ?? new Error("Échec de l’envoi du fichier.");
  }

  let lastCompleteError: Error | null = null;
  for (let completeAttempt = 1; completeAttempt <= MAX_ATTEMPTS; completeAttempt += 1) {
    if (completeAttempt > 1) {
      onAttempt?.(completeAttempt, MAX_ATTEMPTS);
    }

    try {
      const complete = await postJson<CompleteResponse>(
        withDeployedBase("/api/signalement/piece/complete"),
        { completeToken: presign.completeToken },
      );

      if (!complete.ok || typeof complete.id !== "number") {
        throw new Error(complete.error || "Échec de l’enregistrement du fichier.");
      }

      return complete.id;
    } catch (error) {
      lastCompleteError =
        error instanceof Error ? error : new Error("Échec de l’enregistrement du fichier.");
      if (completeAttempt < MAX_ATTEMPTS) {
        await sleep(RETRY_BASE_DELAY_MS * completeAttempt);
      }
    }
  }

  throw lastCompleteError ?? new Error("Échec de l’enregistrement du fichier.");
}

function uploadSignalementPieceViaServer(
  file: File,
  onProgress: (percent: number) => void,
): Promise<number> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", withDeployedBase("/api/signalement/piece"));
    xhr.responseType = "text";

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) return;
      const percent = Math.min(100, Math.round((event.loaded / event.total) * 100));
      onProgress(percent);
    };

    xhr.onload = () => {
      const data = parseJson<CompleteResponse>(xhr);
      if (xhr.status >= 200 && xhr.status < 300 && data.ok && typeof data.id === "number") {
        resolve(data.id);
        return;
      }
      reject(new Error(data.error || "Échec de l’envoi du fichier."));
    };

    xhr.onerror = () => reject(new Error("Erreur réseau lors de l’envoi du fichier."));
    xhr.onabort = () => reject(new Error("Envoi annulé."));

    const fd = new FormData();
    fd.append("piece", file, file.name);
    xhr.send(fd);
  });
}
