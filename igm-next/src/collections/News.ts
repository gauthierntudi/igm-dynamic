import { lexicalHTMLField } from "@payloadcms/richtext-lexical";
import type { CollectionConfig } from "payload";
import { slugField } from "payload";

import { isAdmin, publishedRead } from "../access/isAdmin";
import { LOCALIZED } from "../fields/localized";
import { newsCategoryFields } from "../fields/newsCategoryFields";
import { revalidateFrontCollection } from "../hooks/revalidateFront";
import { slugifyTitle } from "../lib/slugify";

export const News: CollectionConfig = {
  slug: "news",
  labels: {
    singular: "Actualité",
    plural: "Actualités",
  },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "category", "publishedAt", "_status"],
    description:
      "Articles publiés sur la page Actualités et dans le carrousel de la page d'accueil. Renseignez le contenu en français et en anglais (onglets FR / EN).",
    listSearchableFields: ["title", "slug", "category", "categoryCustom", "excerpt"],
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
            slugField({
              localized: true,
              useAsSlug: "title",
              slugify: ({ valueToSlugify }) => slugifyTitle(valueToSlugify),
              overrides: (row) => {
                const slugInput = row.fields.find(
                  (field) => field.type === "text" && field.name === "slug",
                );
                if (slugInput?.type === "text") {
                  slugInput.label = "Slug URL";
                  slugInput.admin = {
                    ...slugInput.admin,
                    description:
                      "Généré automatiquement depuis le titre. Modifiez-le pour personnaliser l'URL.",
                  };
                }
                return row;
              },
            }),
            {
              name: "excerpt",
              type: "textarea",
              label: "Extrait",
              required: true,
              ...LOCALIZED,
              admin: {
                description: "Court résumé affiché sur la carte et en tête de l'article.",
              },
            },
            ...newsCategoryFields,
            {
              name: "publishedAt",
              type: "date",
              label: "Date de publication",
              required: true,
              admin: {
                date: {
                  pickerAppearance: "dayAndTime",
                },
                position: "sidebar",
              },
            },
            {
              name: "cover",
              type: "upload",
              relationTo: "media",
              label: "Image de couverture",
              admin: {
                description: "Image affichée sur la carte et en tête de l'article.",
              },
            },
          ],
        },
        {
          label: "Contenu",
          fields: [
            {
              name: "content",
              type: "richText",
              label: "Corps de l'article",
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
