import { getFileKey } from "@payloadcms/plugin-cloud-storage/utilities";

const privatePrefix = process.env.S3_PRIVATE_PREFIX || "private/signalements";

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

export function isSignalementS3DirectUploadEnabledClient(): boolean {
  if (process.env.NEXT_PUBLIC_SIGNALEMENT_S3_DIRECT_UPLOAD === "true") {
    return true;
  }
  if (process.env.NEXT_PUBLIC_SIGNALEMENT_S3_DIRECT_UPLOAD === "false") {
    return false;
  }

  return process.env.NEXT_PUBLIC_SIGNALEMENT_S3_DIRECT_UPLOAD === undefined
    ? process.env.NODE_ENV === "production"
    : false;
}

export function buildSignalementS3ObjectKey(filename: string, docPrefix = ""): string {
  const { fileKey } = getFileKey({
    collectionPrefix: signalementS3CollectionPrefix(),
    docPrefix,
    filename,
  });
  return fileKey;
}
