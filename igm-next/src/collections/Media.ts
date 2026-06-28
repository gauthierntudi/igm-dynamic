import type { CollectionConfig } from "payload";

import { invalidateMediaCdn } from "../hooks/invalidateMediaCdn";
import { mediaAdminFileUrl } from "../hooks/mediaAdminFileUrl";
import {
  mediaDefaultAltBeforeChange,
  mediaDefaultAltBeforeValidate,
} from "../hooks/mediaDefaultAlt";
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
    beforeValidate: [mediaDefaultAltBeforeValidate],
    beforeChange: [mediaDefaultAltBeforeChange],
    afterChange: [invalidateMediaCdn, revalidateFrontCollection],
    afterRead: [mediaAdminFileUrl],
  },
  fields: [
    {
      name: "alt",
      type: "text",
      label: "Texte alternatif",
      required: false,
      defaultValue: "",
      admin: {
        description:
          "Optionnel lors d’un upload groupé : laissez vide pour génération automatique (nom du fichier). Utilisez « Modifier tout » dans le tiroir d’upload pour appliquer le même texte à tous les fichiers.",
      },
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
