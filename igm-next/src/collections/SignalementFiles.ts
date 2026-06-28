import type { CollectionConfig } from "payload";

import { isAdmin } from "../access/isAdmin";
import { signalementFileAdminUrl } from "../hooks/signalementFileAdminUrl";

const privatePrefix = process.env.S3_PRIVATE_PREFIX || "private/signalements";

export const SignalementFiles: CollectionConfig = {
  slug: "signalement-files",
  labels: {
    singular: "Fichier signalement",
    plural: "Fichiers signalement",
  },
  access: {
    create: isAdmin,
    read: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  admin: {
    hidden: ({ user }) => !user,
    useAsTitle: "filename",
    defaultColumns: ["filename", "mimeType", "filesize", "createdAt"],
  },
  fields: [],
  hooks: {
    afterRead: [signalementFileAdminUrl],
  },
  upload: {
    staticDir: "signalement-files",
    mimeTypes: ["image/*", "audio/*", "video/*", "application/pdf"],
  },
};

export const signalementFilesS3CollectionConfig = {
  prefix: privatePrefix,
  signedDownloads: true,
};
