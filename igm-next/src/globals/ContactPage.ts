import type { GlobalConfig } from "payload";

import { isAdmin } from "../access/isAdmin";
import { LOCALIZED } from "../fields/localized";
import { revalidateFrontGlobal } from "../hooks/revalidateFront";

export const ContactPage: GlobalConfig = {
  slug: "contact-page",
  label: "Page Contact",
  admin: {
    description:
      "Textes de la page /contact (bannière, formulaire, bloc coordonnées). L’image de bannière se configure dans « Bannières de pages ». Téléphone, e-mail et adresse : « Paramètres du site ».",
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
      tabs: [
        {
          label: "SEO",
          fields: [
            {
              name: "seoTitle",
              type: "text",
              label: "Titre SEO",
              defaultValue: "Contact — IGM",
              ...LOCALIZED,
            },
            {
              name: "seoDescription",
              type: "textarea",
              label: "Description SEO",
              ...LOCALIZED,
            },
          ],
        },
        {
          label: "Bannière",
          fields: [
            {
              name: "heroTitle",
              type: "text",
              label: "Titre bannière",
              defaultValue: "Contact",
              ...LOCALIZED,
            },
            {
              name: "heroLead",
              type: "textarea",
              label: "Sous-titre bannière",
              admin: {
                description: "Optionnel. Laisser vide pour n'afficher aucun sous-titre.",
              },
              ...LOCALIZED,
            },
          ],
        },
        {
          label: "Formulaire",
          fields: [
            {
              name: "eyebrow",
              type: "text",
              label: "Sur-titre",
              defaultValue: "Nous contacter",
              ...LOCALIZED,
            },
            {
              name: "formTitle",
              type: "text",
              label: "Titre du formulaire",
              defaultValue: "Nous serions ravis de vous lire",
              ...LOCALIZED,
            },
          ],
        },
        {
          label: "Coordonnées",
          fields: [
            {
              name: "infoTitle",
              type: "text",
              label: "Titre bloc coordonnées",
              defaultValue: "Nos coordonnées",
              ...LOCALIZED,
            },
            {
              name: "infoLead",
              type: "textarea",
              label: "Texte d'introduction",
              admin: {
                description:
                  "Repli : texte « Contact » du pied de page (Paramètres du site).",
              },
              ...LOCALIZED,
            },
          ],
        },
      ],
    },
  ],
};
