import type { CollectionConfig } from "payload";

import { isAdmin, publishedRead } from "../access/isAdmin";
import { LOCALIZED } from "../fields/localized";
import { revalidateFrontCollection } from "../hooks/revalidateFront";

export const News: CollectionConfig = {
  slug: "news",
  labels: {
    singular: "Actualité",
    plural: "Actualités",
  },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "publishedAt", "_status"],
    description: "Contenu éditorial en français et en anglais (onglets FR / EN).",
  },
  versions: {
    drafts: true,
  },
  access: {
    read: publishedRead,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  hooks: {
    afterChange: [revalidateFrontCollection],
  },
  fields: [
    {
      name: "title",
      type: "text",
      label: "Titre",
      required: true,
      ...LOCALIZED,
    },
    {
      name: "slug",
      type: "text",
      label: "Slug",
      required: true,
      unique: true,
      index: true,
      ...LOCALIZED,
    },
    {
      name: "excerpt",
      type: "textarea",
      label: "Extrait",
      required: true,
      ...LOCALIZED,
    },
    {
      name: "category",
      type: "text",
      label: "Catégorie",
      ...LOCALIZED,
    },
    {
      name: "publishedAt",
      type: "date",
      label: "Date de publication",
      required: true,
      admin: {
        date: {
          pickerAppearance: "dayAndTime",
        },
      },
    },
    {
      name: "cover",
      type: "upload",
      relationTo: "media",
      label: "Image",
    },
  ],
};
