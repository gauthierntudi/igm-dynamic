import type { CollectionConfig } from "payload";

import { isAdmin } from "../access/isAdmin";

const privatePrefix = process.env.S3_PRIVATE_PREFIX || "private/signalements";

export const SignalementFiles: CollectionConfig = {
  slug: "signalement-files",
  labels: {
    singular: "Fichier signalement",
    plural: "Fichiers signalement",
  },
  access: {
    create: () => true,
    read: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  admin: {
    hidden: ({ user }) => !user,
    useAsTitle: "filename",
  },
  fields: [],
  upload: {
    staticDir: "signalement-files",
    mimeTypes: ["image/*", "audio/*", "video/*", "application/pdf"],
  },
};

export const signalementFilesS3CollectionConfig = {
  prefix: privatePrefix,
  signedDownloads: true,
};
