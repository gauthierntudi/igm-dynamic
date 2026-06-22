import type { CollectionAfterChangeHook } from "payload";

import {
  invalidateCloudFrontPaths,
  mediaObjectPaths,
} from "@/lib/cloudfrontInvalidation";

function collectMediaPaths(
  doc: { filename?: string | null; prefix?: string | null; sizes?: unknown },
): string[] {
  const paths = mediaObjectPaths(doc.filename, doc.prefix);

  if (doc.sizes && typeof doc.sizes === "object") {
    for (const size of Object.values(doc.sizes as Record<string, { filename?: string | null }>)) {
      paths.push(...mediaObjectPaths(size?.filename, doc.prefix));
    }
  }

  return paths;
}

/** Purge CloudFront quand un média est recadré ou remplacé (même clé S3, cache CDN obsolète). */
export const invalidateMediaCdn: CollectionAfterChangeHook = async ({
  doc,
  previousDoc,
}) => {
  const paths = new Set<string>([
    ...collectMediaPaths(doc),
    ...(previousDoc ? collectMediaPaths(previousDoc) : []),
  ]);

  try {
    await invalidateCloudFrontPaths([...paths]);
  } catch (err) {
    console.error("[media] invalidateMediaCdn:", err);
  }

  return doc;
};
