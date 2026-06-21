import type { CollectionConfig } from "payload";

import { isAdmin, publishedRead } from "../access/isAdmin";
import { revalidateFrontCollection } from "../hooks/revalidateFront";

export const Pages: CollectionConfig = {
  slug: "pages",
  labels: {
    singular: "Page",
    plural: "Pages",
  },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "slug", "_status", "updatedAt"],
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
      label: "Slug URL",
      required: true,
      unique: true,
      index: true,
      admin: {
        description: "Ex. home, mission, vision, contact",
      },
    },
    {
      type: "group",
      name: "hero",
      label: "Bannière",
      fields: [
        { name: "eyebrow", type: "text", label: "Sur-titre" },
        { name: "title", type: "text", label: "Titre principal" },
        { name: "lead", type: "textarea", label: "Chapô" },
        { name: "ctaLabel", type: "text", label: "Libellé bouton" },
        { name: "ctaHref", type: "text", label: "Lien bouton" },
        {
          name: "media",
          type: "upload",
          relationTo: "media",
          label: "Image / vidéo",
        },
      ],
    },
    {
      name: "seoTitle",
      type: "text",
      label: "SEO — titre",
    },
    {
      name: "seoDescription",
      type: "textarea",
      label: "SEO — description",
    },
  ],
};
