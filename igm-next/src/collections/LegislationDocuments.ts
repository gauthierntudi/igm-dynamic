import type { CollectionConfig } from "payload";

import { isAdmin, publishedRead } from "../access/isAdmin";
import { LOCALIZED } from "../fields/localized";
import { revalidateFrontCollection } from "../hooks/revalidateFront";
import { LEGISLATION_CATEGORIES, LEGISLATION_CATEGORY_LABELS } from "../lib/legislation/constants";

export const LegislationDocuments: CollectionConfig = {
  slug: "legislation-documents",
  labels: {
    singular: "Document législatif",
    plural: "Documents législation",
  },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "category", "reference", "publishedAt", "_status"],
    listSearchableFields: ["title", "reference", "summary"],
    description:
      "Textes officiels (PDF) affichés sur les pages Ordonnances, Lois, Décrets et Décisions. Uploadez le PDF dans Médias publics puis liez-le ici.",
    pagination: {
      defaultLimit: 25,
    },
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
          label: "Document",
          fields: [
            {
              name: "title",
              type: "text",
              label: "Titre",
              required: true,
              ...LOCALIZED,
            },
            {
              name: "category",
              type: "select",
              label: "Rubrique",
              required: true,
              options: LEGISLATION_CATEGORIES.map((value) => ({
                value,
                label: LEGISLATION_CATEGORY_LABELS[value].fr,
              })),
              admin: {
                description: "Page sur laquelle le document sera listé.",
              },
            },
            {
              name: "reference",
              type: "text",
              label: "Référence",
              admin: {
                description: "Ex. Loi n°007/2002, Décret n°23/19…",
              },
            },
            {
              name: "summary",
              type: "textarea",
              label: "Résumé",
              ...LOCALIZED,
            },
            {
              name: "publishedAt",
              type: "date",
              label: "Date du texte",
              admin: {
                date: {
                  pickerAppearance: "dayOnly",
                  displayFormat: "d MMM yyyy",
                },
              },
            },
            {
              name: "order",
              type: "number",
              label: "Ordre d’affichage",
              defaultValue: 0,
              admin: {
                description: "Plus la valeur est basse, plus le document apparaît en haut.",
              },
            },
            {
              name: "file",
              type: "upload",
              relationTo: "media",
              label: "Fichier PDF",
              required: true,
              admin: {
                description: "Le média doit être un PDF (collection Médias publics).",
              },
            },
          ],
        },
      ],
    },
  ],
};
