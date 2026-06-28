import type { CollectionConfig } from "payload";

import { isAdmin, publishedRead } from "../access/isAdmin";
import { LOCALIZED } from "../fields/localized";
import { revalidateFrontCollection } from "../hooks/revalidateFront";

/** Vidéos publiées une par une sur /videos. */
export const MediaGalleryItems: CollectionConfig = {
  slug: "media-gallery-items",
  labels: {
    singular: "Vidéo médiathèque",
    plural: "Vidéos médiathèque",
  },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "publishedAt", "_status"],
    listSearchableFields: ["title", "summary", "caption"],
    description:
      "Vidéos affichées sur /videos. Uploadez le fichier dans Médias publics puis liez-le ici. Les photos se gèrent dans « Albums photos ».",
    group: "Contenu",
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
          label: "Vidéo",
          fields: [
            {
              name: "title",
              type: "text",
              label: "Titre",
              required: true,
              ...LOCALIZED,
            },
            {
              name: "summary",
              type: "textarea",
              label: "Description courte",
              ...LOCALIZED,
            },
            {
              name: "caption",
              type: "textarea",
              label: "Légende",
              admin: {
                description: "Texte affiché sous la vidéo dans la galerie.",
              },
              ...LOCALIZED,
            },
            {
              name: "publishedAt",
              type: "date",
              label: "Date de publication",
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
                description: "Plus la valeur est basse, plus la vidéo apparaît en haut.",
              },
            },
            {
              name: "media",
              type: "upload",
              relationTo: "media",
              label: "Fichier vidéo",
              required: true,
              admin: {
                description: "Vidéo MP4 (collection Médias publics).",
              },
            },
          ],
        },
      ],
    },
  ],
};
