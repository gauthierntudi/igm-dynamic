import type { CollectionConfig } from "payload";

import { publicMediaUrl } from "../lib/mediaUrl";
import { revalidateFrontCollection } from "../hooks/revalidateFront";

const publicPrefix = process.env.S3_PUBLIC_PREFIX || "public";

export const Media: CollectionConfig = {
  slug: "media",
  labels: {
    singular: "Média public",
    plural: "Médias publics",
  },
  access: {
    read: () => true,
  },
  admin: {
    useAsTitle: "filename",
    defaultColumns: ["filename", "alt", "updatedAt"],
  },
  hooks: {
    afterChange: [revalidateFrontCollection],
  },
  fields: [
    {
      name: "alt",
      type: "text",
      label: "Texte alternatif",
      required: true,
    },
  ],
  upload: {
    staticDir: "media",
    mimeTypes: ["image/*", "video/*", "application/pdf"],
  },
};

/** Config S3 pour la collection `media` (voir payload.config.ts). */
export const mediaS3CollectionConfig = {
  prefix: publicPrefix,
  disablePayloadAccessControl: true,
  generateFileURL: ({
    filename,
    prefix,
  }: {
    filename?: string | null;
    prefix?: string | null;
  }) => publicMediaUrl(prefix ?? publicPrefix, filename ?? undefined) ?? "",
};
