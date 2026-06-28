import type { GlobalConfig } from "payload";

import { isAdmin } from "../access/isAdmin";
import { LEGISLATION_CATEGORIES, LEGISLATION_CATEGORY_LABELS } from "../lib/legislation/constants";
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
      "Images de bannière des pages Ordonnances, Lois, Décrets et Décisions (/ordonnances, /lois, etc.).",
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
        fields: [heroImageField(`${category}HeroImage`, "Image bannière")],
      })),
    },
  ],
};
