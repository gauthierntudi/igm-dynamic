import { DeleteObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import type { Payload } from "payload";

import { s3MediaBucket, s3MediaClient } from "@/lib/s3MediaClient";

import { SIGNALEMENT_ORPHAN_MAX_AGE_MS } from "./constants";
import {
  isSignalementS3Configured,
  signalementS3CollectionPrefix,
} from "./signalementS3DirectUpload";

export type CleanupOrphanSignalementS3Result = {
  scanned: number;
  deleted: number;
  failed: number;
};

const DEFAULT_MAX_DELETES = 200;

async function loadKnownSignalementFilenames(payload: Payload): Promise<Set<string>> {
  const filenames = new Set<string>();
  let page = 1;

  while (true) {
    const result = await payload.find({
      collection: "signalement-files",
      limit: 200,
      page,
      depth: 0,
      overrideAccess: true,
    });

    for (const doc of result.docs) {
      if (typeof doc.filename === "string" && doc.filename.trim()) {
        filenames.add(doc.filename.trim());
      }
    }

    if (!result.hasNextPage) {
      break;
    }
    page += 1;
  }

  return filenames;
}

/** Supprime les objets S3 orphelins (upload direct sans enregistrement Payload). */
export async function cleanupOrphanSignalementS3Objects(
  payload: Payload,
  options: { maxDeletes?: number } = {},
): Promise<CleanupOrphanSignalementS3Result> {
  if (!isSignalementS3Configured()) {
    return { scanned: 0, deleted: 0, failed: 0 };
  }

  const maxDeletes = options.maxDeletes ?? DEFAULT_MAX_DELETES;
  const cutoffMs = Date.now() - SIGNALEMENT_ORPHAN_MAX_AGE_MS;
  const prefix = `${signalementS3CollectionPrefix().replace(/\/+$/, "")}/`;
  const knownFilenames = await loadKnownSignalementFilenames(payload);

  const client = s3MediaClient();
  const bucket = s3MediaBucket();

  let scanned = 0;
  let deleted = 0;
  let failed = 0;
  let continuationToken: string | undefined;

  while (deleted + failed < maxDeletes) {
    const listing = await client.send(
      new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: prefix,
        ContinuationToken: continuationToken,
        MaxKeys: 100,
      }),
    );

    const objects = listing.Contents ?? [];
    if (!objects.length && !listing.IsTruncated) {
      break;
    }

    for (const object of objects) {
      if (!object.Key || !object.LastModified) {
        continue;
      }

      if (object.LastModified.getTime() > cutoffMs) {
        continue;
      }

      const relativeKey = object.Key.slice(prefix.length);
      if (!relativeKey || relativeKey.includes("/")) {
        continue;
      }

      scanned += 1;

      if (knownFilenames.has(relativeKey)) {
        continue;
      }

      if (deleted + failed >= maxDeletes) {
        break;
      }

      try {
        await client.send(
          new DeleteObjectCommand({
            Bucket: bucket,
            Key: object.Key,
          }),
        );
        deleted += 1;
      } catch (error) {
        console.error("[signalement] orphan S3 delete failed", object.Key, error);
        failed += 1;
      }
    }

    if (!listing.IsTruncated) {
      break;
    }
    continuationToken = listing.NextContinuationToken;
  }

  return { scanned, deleted, failed };
}
