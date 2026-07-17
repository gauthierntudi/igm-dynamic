import type { CollectionConfig } from "payload";

import { isAdmin, publishedRead } from "../access/isAdmin";
import { LOCALIZED } from "../fields/localized";
import { revalidateFrontCollection } from "../hooks/revalidateFront";
import { parseYoutubeVideoId } from "../lib/cms/media-gallery/parseYoutubeUrl";

/** Vidéos YouTube publiées une par une sur /videos. */
export const MediaGalleryItems: CollectionConfig = {
  slug: "media-gallery-items",
  labels: {
    singular: "Vidéo médiathèque",
    plural: "Vidéos médiathèque",
  },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "order", "publishedAt", "_status"],
    listSearchableFields: ["title", "summary", "caption", "youtubeUrl"],
    description:
      "Vidéos affichées sur /videos. Collez l’URL YouTube (watch, shorts ou youtu.be). Les photos se gèrent dans « Albums photos ».",
    group: "Contenu",
    pagination: {
      defaultLimit: 25,
    },
  },
  defaultSort: "order",
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
                description: "Texte affiché sous la vidéo dans le lecteur.",
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
              defaultValue: 1,
              admin: {
                description:
                  "Position sur /videos : 1 = première, 2 = deuxième, 3 = troisième, etc. Publiez après modification.",
              },
            },
            {
              name: "youtubeUrl",
              type: "text",
              label: "Lien YouTube",
              required: true,
              admin: {
                description:
                  "Exemple : https://www.youtube.com/watch?v=… ou https://youtu.be/…",
                placeholder: "https://www.youtube.com/watch?v=",
              },
              validate: (value: unknown) => {
                if (typeof value !== "string" || !value.trim()) {
                  return "Le lien YouTube est requis.";
                }
                if (!parseYoutubeVideoId(value)) {
                  return "URL YouTube invalide. Utilisez un lien watch, youtu.be, embed ou shorts.";
                }
                return true;
              },
            },
          ],
        },
      ],
    },
  ],
};
