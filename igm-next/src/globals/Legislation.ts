import type { GlobalConfig } from "payload";

import { isAdmin } from "../access/isAdmin";
import { LOCALIZED } from "../fields/localized";
import { LEGISLATION_CATEGORIES, LEGISLATION_CATEGORY_LABELS } from "../lib/legislation/constants";
import { getMessages } from "../i18n/messages";
import { revalidateFrontGlobal } from "../hooks/revalidateFront";

const heroImageField = (name: string, label: string) =>
  ({
    name,
    type: "upload",
    relationTo: "media",
    label,
    admin: {
      description: "Image de fond de la bannière en haut de page (recommandé : paysage, ≥ 1920×600 px).",
    },
  }) as const;

export const Legislation: GlobalConfig = {
  slug: "legislation",
  label: "Pages Législation",
  admin: {
    description:
      "Bannières des pages Ordonnances, Lois, Décrets et Décisions : image, titre (H1) et sous-titre.",
    group: "Contenu",
  },
  access: {
    read: () => true,
    update: isAdmin,
  },
  hooks: {
    afterChange: [revalidateFrontGlobal],
  },
  fields: [
    {
      type: "tabs",
      tabs: LEGISLATION_CATEGORIES.map((category) => ({
        label: LEGISLATION_CATEGORY_LABELS[category].fr,
        fields: [
          heroImageField(`${category}HeroImage`, "Image bannière"),
          {
            name: `${category}HeroTitle`,
            type: "text",
            label: "Titre bannière (H1)",
            admin: {
              description: "Titre principal et fil d'Ariane.",
            },
            defaultValue: getMessages("fr").legislationPage.categories[category].title,
            ...LOCALIZED,
          },
          {
            name: `${category}HeroSubtitle`,
            type: "textarea",
            label: "Sous-titre bannière",
            admin: {
              description: "Optionnel. Laisser vide pour n'afficher aucun sous-titre.",
            },
            ...LOCALIZED,
          },
        ],
      })),
    },
  ],
};
