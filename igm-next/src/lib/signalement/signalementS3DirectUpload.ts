import path from "path";

const privatePrefix = process.env.S3_PRIVATE_PREFIX || "private/signalements";

function sanitizeStoragePrefix(prefix: string): string {
  let decodedPrefix: string;
  try {
    decodedPrefix = decodeURIComponent(prefix);
  } catch {
    return "";
  }

  if (/%[0-9a-f]{2}/i.test(decodedPrefix)) {
    return "";
  }

  return decodedPrefix
    .replace(/\\/g, "/")
    .split("/")
    .filter((segment) => segment !== ".." && segment !== ".")
    .join("/")
    .replace(/^\/+/, "")
    .replace(/[\x00-\x1f\x80-\x9f]/g, "");
}

export function signalementS3CollectionPrefix(): string {
  return privatePrefix;
}

export function isSignalementS3Configured(): boolean {
  return Boolean(
    process.env.S3_BUCKET?.trim() &&
      process.env.S3_ACCESS_KEY_ID?.trim() &&
      process.env.S3_SECRET_ACCESS_KEY?.trim(),
  );
}

/** Upload direct navigateur → S3 pour les pièces signalement (prod). */
export function isSignalementS3DirectUploadEnabled(): boolean {
  if (!isSignalementS3Configured()) {
    return false;
  }

  if (process.env.SIGNALEMENT_S3_DIRECT_UPLOAD === "true") {
    return true;
  }
  if (process.env.SIGNALEMENT_S3_DIRECT_UPLOAD === "false") {
    return false;
  }

  if (process.env.PAYLOAD_CLIENT_UPLOADS === "true") {
    return true;
  }
  if (process.env.PAYLOAD_CLIENT_UPLOADS === "false") {
    return false;
  }

  return process.env.NODE_ENV === "production";
}

/** Clé S3 alignée sur @payloadcms/plugin-cloud-storage (sans import Payload). */
export function buildSignalementS3ObjectKey(filename: string, docPrefix = ""): string {
  const collectionPrefix = sanitizeStoragePrefix(signalementS3CollectionPrefix());
  const safeDocPrefix = sanitizeStoragePrefix(docPrefix);
  const safeFilename = filename.replace(/[/\\]/g, "_");
  return path.posix.join(safeDocPrefix || collectionPrefix, safeFilename);
}
