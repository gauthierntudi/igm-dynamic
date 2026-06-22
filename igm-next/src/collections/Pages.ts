import { lexicalHTMLField } from "@payloadcms/richtext-lexical";
import type { CollectionConfig } from "payload";

import { isAdmin, publishedRead } from "../access/isAdmin";
import { LOCALIZED } from "../fields/localized";
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
    description:
      "Chaque page correspond à une URL du site. Renseignez le contenu en français et en anglais (onglets FR / EN). Le slug peut différer par langue (ex. a-propos / about).",
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
      type: "tabs",
      tabs: [
        {
          label: "Général",
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
              label: "Slug URL",
              required: true,
              unique: true,
              index: true,
              ...LOCALIZED,
              admin: {
                description:
                  "Segment d’URL sans slash, par langue. Ex. FR : a-propos — EN : about.",
              },
            },
            {
              name: "summary",
              type: "textarea",
              label: "Résumé",
              ...LOCALIZED,
              admin: {
                description: "Court texte affiché sous la bannière (optionnel).",
              },
            },
          ],
        },
        {
          label: "Bannière",
          fields: [
            {
              type: "group",
              name: "hero",
              label: "Bannière",
              fields: [
                { name: "eyebrow", type: "text", label: "Sur-titre", ...LOCALIZED },
                { name: "title", type: "text", label: "Titre principal", ...LOCALIZED },
                { name: "lead", type: "textarea", label: "Chapô", ...LOCALIZED },
                { name: "ctaLabel", type: "text", label: "Libellé bouton", ...LOCALIZED },
                { name: "ctaHref", type: "text", label: "Lien bouton", ...LOCALIZED },
                {
                  name: "media",
                  type: "upload",
                  relationTo: "media",
                  label: "Image de fond",
                },
              ],
            },
          ],
        },
        {
          label: "Contenu",
          fields: [
            {
              name: "content",
              type: "richText",
              label: "Corps de la page",
              ...LOCALIZED,
            },
            {
              ...lexicalHTMLField({
                htmlFieldName: "contentHtml",
                lexicalFieldName: "content",
                storeInDB: true,
              }),
              ...LOCALIZED,
            },
          ],
        },
        {
          label: "SEO",
          fields: [
            {
              name: "seoTitle",
              type: "text",
              label: "SEO — titre",
              ...LOCALIZED,
            },
            {
              name: "seoDescription",
              type: "textarea",
              label: "SEO — description",
              ...LOCALIZED,
            },
          ],
        },
      ],
    },
  ],
};
