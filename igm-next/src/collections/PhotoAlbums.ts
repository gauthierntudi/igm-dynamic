import type { CollectionConfig } from "payload";
import { slugField } from "payload";

import { isAdmin, publishedRead } from "../access/isAdmin";
import { LOCALIZED } from "../fields/localized";
import { revalidateFrontCollection } from "../hooks/revalidateFront";
import { slugifyTitle } from "../lib/slugify";

export const PhotoAlbums: CollectionConfig = {
  slug: "photo-albums",
  labels: {
    singular: "Album photo",
    plural: "Albums photos",
  },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "slug", "publishedAt", "_status"],
    listSearchableFields: ["title", "slug", "summary"],
    description:
      "Albums affichés sur /photos. Ajoutez une ou plusieurs images par album (Médias publics). Les vidéos se gèrent dans « Vidéos médiathèque ».",
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
          label: "Album",
          fields: [
            {
              name: "title",
              type: "text",
              label: "Titre de l’album",
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
                    description: "URL : /photos/{slug}",
                  };
                }
                return row;
              },
            }),
            {
              name: "summary",
              type: "textarea",
              label: "Description",
              ...LOCALIZED,
            },
            {
              name: "coverImage",
              type: "upload",
              relationTo: "media",
              label: "Image de couverture",
              admin: {
                description:
                  "Optionnel. Repli : première photo de l’album.",
              },
            },
            {
              name: "photos",
              type: "upload",
              relationTo: "media",
              hasMany: true,
              label: "Photos",
              required: true,
              admin: {
                description:
                  "Sélectionnez une ou plusieurs images (JPEG, PNG, WebP…).",
              },
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
                description: "Plus la valeur est basse, plus l’album apparaît en haut.",
              },
            },
          ],
        },
      ],
    },
  ],
};
