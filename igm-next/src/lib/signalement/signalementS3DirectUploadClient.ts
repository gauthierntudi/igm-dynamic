/** Client-safe : active l’upload direct S3 (sans imports Payload). */
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
