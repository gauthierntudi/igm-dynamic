import type { AllowList, UploadConfig } from "payload";

const publicPrefix = process.env.S3_PUBLIC_PREFIX || "public";

function cdnSkipSafeFetchAllowList(): AllowList | undefined {
  const cdn = process.env.NEXT_PUBLIC_CDN_URL?.trim();
  if (!cdn) return undefined;

  try {
    const parsed = new URL(cdn);
    return [
      {
        hostname: parsed.hostname,
        protocol: parsed.protocol.replace(":", "") as "http" | "https",
      },
    ];
  } catch {
    return undefined;
  }
}

export const mediaUploadConfig: UploadConfig = {
  staticDir: "media",
  mimeTypes: ["image/*", "video/*", "application/pdf"],
  crop: true,
  focalPoint: true,
  skipSafeFetch: cdnSkipSafeFetchAllowList(),
  /** Vignette admin pour les vidéos (poster généré par generateVideoPoster). */
  adminThumbnail: "poster",
  imageSizes: [
    {
      name: "poster",
      width: 640,
      height: 360,
      position: "centre",
    },
  ],
};

export { publicPrefix };
