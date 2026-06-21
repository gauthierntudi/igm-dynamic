import type { CollectionConfig } from "payload";

import { isAdmin, publishedRead } from "../access/isAdmin";
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
    },
    {
      name: "slug",
      type: "text",
      label: "Slug",
      required: true,
      unique: true,
      index: true,
    },
    {
      name: "excerpt",
      type: "textarea",
      label: "Extrait",
      required: true,
    },
    {
      name: "category",
      type: "text",
      label: "Catégorie",
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
