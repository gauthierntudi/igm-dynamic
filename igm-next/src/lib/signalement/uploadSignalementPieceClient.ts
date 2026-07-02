import { withDeployedBase } from "@/lib/deployBasePath";
import { isSignalementS3DirectUploadEnabledClient } from "@/lib/signalement/signalementS3DirectUpload";

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
): Promise<number> {
  if (!isSignalementS3DirectUploadEnabledClient()) {
    return uploadSignalementPieceViaServer(file, onProgress);
  }

  try {
    return await uploadSignalementPieceViaS3Presign(file, onProgress);
  } catch (error) {
    if (error instanceof Error && error.message.includes("indisponible")) {
      return uploadSignalementPieceViaServer(file, onProgress);
    }
    throw error;
  }
}

async function uploadSignalementPieceViaS3Presign(
  file: File,
  onProgress: (percent: number) => void,
): Promise<number> {
  const presign = await postJson<PresignResponse>(
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

  const complete = await postJson<CompleteResponse>(
    withDeployedBase("/api/signalement/piece/complete"),
    { completeToken: presign.completeToken },
  );

  if (!complete.ok || typeof complete.id !== "number") {
    throw new Error(complete.error || "Échec de l’enregistrement du fichier.");
  }

  return complete.id;
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
