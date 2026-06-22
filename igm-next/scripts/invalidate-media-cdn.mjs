#!/usr/bin/env node
/**
 * Purge CloudFront pour un ou plusieurs chemins média.
 * Usage: npm run invalidate:media-cdn -- public/Felix-Antoine-Tshisekedi.jpg
 */
import {
  CloudFrontClient,
  CreateInvalidationCommand,
} from "@aws-sdk/client-cloudfront";

const paths = process.argv.slice(2).map((p) => (p.startsWith("/") ? p : `/${p}`));
if (paths.length === 0) {
  console.error("Usage: npm run invalidate:media-cdn -- public/mon-fichier.jpg");
  process.exit(1);
}

const credentials = {
  accessKeyId: process.env.S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
};

if (!credentials.accessKeyId || !credentials.secretAccessKey) {
  console.error("S3_ACCESS_KEY_ID / S3_SECRET_ACCESS_KEY manquants");
  process.exit(1);
}

const client = new CloudFrontClient({ region: "us-east-1", credentials });

const distributionId = process.env.CLOUDFRONT_DISTRIBUTION_ID?.trim();
if (!distributionId) {
  console.error("CLOUDFRONT_DISTRIBUTION_ID manquant");
  process.exit(1);
}

await client.send(
  new CreateInvalidationCommand({
    DistributionId: distributionId,
    InvalidationBatch: {
      CallerReference: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
      Paths: { Quantity: paths.length, Items: paths },
    },
  }),
);

console.log(`Invalidation CloudFront (${distributionId}) : ${paths.join(", ")}`);
