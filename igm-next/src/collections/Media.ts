import type { CollectionConfig } from "payload";

import { invalidateMediaCdn } from "../hooks/invalidateMediaCdn";
import { mediaAdminFileUrl } from "../hooks/mediaAdminFileUrl";
import { revalidateFrontCollection } from "../hooks/revalidateFront";

import { mediaUploadConfig, publicPrefix } from "./mediaUploadConfig";

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
    components: {
      edit: {
        Upload: "@/components/admin/MediaCollectionUpload#MediaCollectionUpload",
      },
    },
  },
  hooks: {
    afterChange: [invalidateMediaCdn, revalidateFrontCollection],
    afterRead: [mediaAdminFileUrl],
  },
  fields: [
    {
      name: "alt",
      type: "text",
      label: "Texte alternatif",
      required: true,
    },
  ],
  upload: mediaUploadConfig,
};

/**
 * Config S3 pour la collection `media` (voir payload.config.ts).
 * Sans disablePayloadAccessControl : /api/media/file/ stream depuis S3 (cropper admin).
 * Le site public utilise mediaUrl() → CDN CloudFront.
 */
export const mediaS3CollectionConfig = {
  prefix: publicPrefix,
};
