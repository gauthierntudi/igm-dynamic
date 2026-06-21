import type { CollectionConfig } from "payload";

import { isAdmin } from "../access/isAdmin";
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
  },
  access: {
    read: () => true,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
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
