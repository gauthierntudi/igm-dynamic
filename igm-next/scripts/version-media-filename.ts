#!/usr/bin/env npx tsx
/**
 * Corrige un média déjà croppé dont CloudFront sert encore l’ancienne version.
 * Usage: npm run media:version-filename -- 3
 */
import { CopyObjectCommand, DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3";

import { publicPrefix } from "../src/collections/mediaUploadConfig";
import { getPayloadClient } from "../src/lib/cms/payload";
import { versionedMediaFilename } from "../src/plugins/mediaFilenameVersioning";

const mediaId = Number(process.argv[2]);
if (!Number.isFinite(mediaId)) {
  console.error("Usage: npm run media:version-filename -- <mediaId>");
  process.exit(1);
}

const bucket = process.env.S3_BUCKET?.trim();
if (!bucket) {
  console.error("S3_BUCKET manquant");
  process.exit(1);
}

const payload = await getPayloadClient();
const doc = await payload.findByID({ collection: "media", id: mediaId, depth: 0 });

if (!doc?.filename || typeof doc.filename !== "string") {
  console.error("Média introuvable:", mediaId);
  process.exit(1);
}

const prefix = typeof doc.prefix === "string" ? doc.prefix : publicPrefix;
const newFilename = versionedMediaFilename(doc.filename);
const sourceKey = `${prefix}/${doc.filename}`;
const destKey = `${prefix}/${newFilename}`;

const client = new S3Client({
  region: process.env.S3_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
  },
});

await client.send(
  new CopyObjectCommand({
    Bucket: bucket,
    CopySource: `${bucket}/${sourceKey}`,
    Key: destKey,
    MetadataDirective: "COPY",
  }),
);
await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: sourceKey }));

await payload.update({
  collection: "media",
  id: mediaId,
  data: { filename: newFilename },
  depth: 0,
});

console.log(`Média ${mediaId}: ${doc.filename} → ${newFilename}`);
console.log(`CDN: ${process.env.NEXT_PUBLIC_CDN_URL}/${destKey}`);
