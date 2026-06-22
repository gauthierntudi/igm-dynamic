import {
  CloudFrontClient,
  CreateInvalidationCommand,
} from "@aws-sdk/client-cloudfront";

let cachedDistributionId: string | null | undefined;

function awsCredentials() {
  const accessKeyId = process.env.S3_ACCESS_KEY_ID?.trim();
  const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY?.trim();
  if (!accessKeyId || !secretAccessKey) return null;
  return { accessKeyId, secretAccessKey };
}

function cloudFrontClient() {
  const credentials = awsCredentials();
  if (!credentials) return null;
  return new CloudFrontClient({ region: "us-east-1", credentials });
}

async function resolveDistributionId(): Promise<string | null> {
  if (cachedDistributionId !== undefined) return cachedDistributionId;

  const explicit = process.env.CLOUDFRONT_DISTRIBUTION_ID?.trim();
  if (!explicit) {
    cachedDistributionId = null;
    return null;
  }

  cachedDistributionId = explicit;
  return explicit;
}

/** Chemins S3/CloudFront (`/public/image.jpg`) à purger du cache CDN. */
export function mediaObjectPaths(
  filename?: string | null,
  prefix?: string | null,
): string[] {
  if (!filename) return [];
  const key = [prefix, filename].filter(Boolean).join("/");
  return [`/${key}`];
}

/** Invalide les chemins CloudFront après crop / remplacement d’un média sur S3. */
export async function invalidateCloudFrontPaths(paths: string[]): Promise<void> {
  const uniquePaths = [...new Set(paths.map((p) => (p.startsWith("/") ? p : `/${p}`)))];
  if (uniquePaths.length === 0) return;

  const client = cloudFrontClient();
  if (!client) return;

  const distributionId = await resolveDistributionId();
  if (!distributionId) {
    console.warn("[cloudfront] Distribution introuvable — ajoutez CLOUDFRONT_DISTRIBUTION_ID");
    return;
  }

  await client.send(
    new CreateInvalidationCommand({
      DistributionId: distributionId,
      InvalidationBatch: {
        CallerReference: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
        Paths: {
          Quantity: uniquePaths.length,
          Items: uniquePaths,
        },
      },
    }),
  );
}
