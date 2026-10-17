import type { CollectionConfig } from "payload";

import { adminHidden, publishedAccess } from "../access/can";
import { LOCALIZED } from "../fields/localized";
import { revalidateFrontCollection } from "../hooks/revalidateFront";

export const Stats: CollectionConfig = {
  slug: "stats",
  labels: {
    singular: "Chiffre clé",
    plural: "Chiffres clés",
  },
  admin: {
    useAsTitle: "label",
    defaultColumns: ["key", "label", "value", "order"],
    group: "Contenu",
    hidden: adminHidden("stats"),
  },
  access: {
    ...publishedAccess("stats"),
    read: () => true,
  },
  hooks: {
    afterChange: [revalidateFrontCollection],
  },
  fields: [
    {
      name: "key",
      type: "text",
      label: "Clé technique",
      required: true,
      unique: true,
      admin: {
        description: "Ex. provinces, missions, inspecteurs",
      },
    },
    {
      name: "label",
      type: "text",
      label: "Libellé affiché",
      required: true,
      ...LOCALIZED,
    },
    {
      name: "value",
      type: "number",
      label: "Valeur",
      required: true,
    },
    {
      name: "suffix",
      type: "text",
      label: "Suffixe",
      ...LOCALIZED,
      admin: { description: "Ex. +, %, Mois" },
    },
    {
      name: "order",
      type: "number",
      label: "Ordre d’affichage",
      defaultValue: 0,
    },
  ],
};
