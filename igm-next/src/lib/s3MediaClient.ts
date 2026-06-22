import { S3Client } from "@aws-sdk/client-s3";

import { publicPrefix } from "@/collections/mediaUploadConfig";

export function s3MediaClient(): S3Client {
  const accessKeyId = process.env.S3_ACCESS_KEY_ID?.trim();
  const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY?.trim();
  if (!accessKeyId || !secretAccessKey) {
    throw new Error("Credentials S3 manquantes (S3_ACCESS_KEY_ID / S3_SECRET_ACCESS_KEY)");
  }

  return new S3Client({
    region: process.env.S3_REGION || "us-east-1",
    credentials: { accessKeyId, secretAccessKey },
  });
}

export function s3MediaBucket(): string {
  const bucket = process.env.S3_BUCKET?.trim();
  if (!bucket) throw new Error("S3_BUCKET manquant");
  return bucket;
}

export function s3ObjectKey(prefix: string | null | undefined, filename: string): string {
  return [prefix || publicPrefix, filename].filter(Boolean).join("/");
}
