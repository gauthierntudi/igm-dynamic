import type { GlobalConfig } from "payload";

import { isAdmin } from "../access/isAdmin";
import { revalidateFrontGlobal } from "../hooks/revalidateFront";

export const SiteSettings: GlobalConfig = {
  slug: "site-settings",
  label: "Paramètres du site",
  access: {
    read: () => true,
    update: isAdmin,
  },
  hooks: {
    afterChange: [revalidateFrontGlobal],
  },
  fields: [
    {
      name: "siteName",
      type: "text",
      label: "Nom du site",
      defaultValue: "IGM",
      required: true,
    },
    {
      name: "phoneVert",
      type: "text",
      label: "Numéro vert",
      defaultValue: "+243 97 684 4563",
    },
    {
      name: "email",
      type: "email",
      label: "Email contact",
      defaultValue: "info@igm.cd",
    },
    {
      name: "address",
      type: "textarea",
      label: "Adresse",
    },
    {
      name: "logo",
      type: "upload",
      relationTo: "media",
      label: "Logo",
    },
    {
      name: "footerText",
      type: "textarea",
      label: "Texte pied de page",
    },
  ],
};
