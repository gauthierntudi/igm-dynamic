import { CopyObjectCommand, DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3";
import type { CollectionAfterChangeHook, Plugin } from "payload";

import { publicPrefix } from "@/collections/mediaUploadConfig";

function s3Client() {
  const accessKeyId = process.env.S3_ACCESS_KEY_ID?.trim();
  const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY?.trim();
  if (!accessKeyId || !secretAccessKey) return null;

  return new S3Client({
    region: process.env.S3_REGION || "us-east-1",
    credentials: { accessKeyId, secretAccessKey },
  });
}

function objectKey(prefix: string | null | undefined, filename: string) {
  return [prefix || publicPrefix, filename].filter(Boolean).join("/");
}

/** Nouveau nom de fichier — évite le cache CloudFront (même clé S3 = image obsolète). */
export function versionedMediaFilename(filename: string): string {
  const dot = filename.lastIndexOf(".");
  const ext = dot >= 0 ? filename.slice(dot + 1) : "";
  const rawBase = dot >= 0 ? filename.slice(0, dot) : filename;
  const base = rawBase.replace(/-\d{13,}$/, "");
  const stamp = Date.now();
  return ext ? `${base}-${stamp}.${ext}` : `${base}-${stamp}`;
}

/**
 * Après crop/remplacement, copie S3 vers un nouveau nom et met à jour le document.
 * Doit s’exécuter après le hook cloud-storage (upload S3).
 */
export const versionMediaFilenameOnReplace: CollectionAfterChangeHook = async ({
  doc,
  previousDoc,
  req,
  operation,
}) => {
  if (operation !== "update") return doc;
  if (!doc?.filename || typeof doc.filename !== "string") return doc;
  if (!previousDoc || typeof previousDoc.filename !== "string") return doc;
  if (req.context?.skipMediaFilenameVersioning) return doc;

  const binaryChanged =
    doc.filesize !== previousDoc.filesize ||
    doc.width !== previousDoc.width ||
    doc.height !== previousDoc.height;

  if (!binaryChanged) return doc;

  const bucket = process.env.S3_BUCKET?.trim();
  const client = s3Client();
  if (!bucket || !client) return doc;

  const prefix = typeof doc.prefix === "string" ? doc.prefix : publicPrefix;
  const newFilename = versionedMediaFilename(doc.filename);
  const sourceKey = objectKey(prefix, doc.filename);
  const destKey = objectKey(prefix, newFilename);

  try {
    await client.send(
      new CopyObjectCommand({
        Bucket: bucket,
        CopySource: `${bucket}/${sourceKey}`,
        Key: destKey,
        ContentType: typeof doc.mimeType === "string" ? doc.mimeType : undefined,
        MetadataDirective: "COPY",
      }),
    );

    if (sourceKey !== destKey) {
      await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: sourceKey }));
    }

    if (!req.context) req.context = {};
    req.context.skipMediaFilenameVersioning = true;

    await req.payload.update({
      collection: "media",
      id: doc.id,
      data: { filename: newFilename },
      req,
      depth: 0,
    });

    return { ...doc, filename: newFilename };
  } catch (err) {
    req.payload.logger.error({ err, msg: "[media] versionMediaFilenameOnReplace" });
    return doc;
  }
};

/** Enregistre le hook après cloud-storage pour qu’il voie le fichier recadré sur S3. */
export function mediaFilenameVersioningPlugin(): Plugin {
  return (config) => ({
    ...config,
    collections: (config.collections ?? []).map((collection) => {
      if (collection.slug !== "media") return collection;

      return {
        ...collection,
        hooks: {
          ...collection.hooks,
          afterChange: [
            ...(collection.hooks?.afterChange ?? []),
            versionMediaFilenameOnReplace,
          ],
        },
      };
    }),
  });
}
