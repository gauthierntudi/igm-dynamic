import type { GlobalConfig } from "payload";

import { isAdmin } from "../access/isAdmin";
import { LOCALIZED } from "../fields/localized";
import { revalidateFrontGlobal } from "../hooks/revalidateFront";

export const PressKitPage: GlobalConfig = {
  slug: "press-kit-page",
  label: "Dossier de presse",
  admin: {
    description:
      "PDF de présentation de l’IGM affiché sur /dossier-de-presse. L’image de bannière se configure dans « Bannières de pages ».",
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
              defaultValue: "Dossier de presse — IGM",
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
              defaultValue: "Dossier de presse",
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
          label: "Document",
          fields: [
            {
              name: "presentationPdf",
              type: "upload",
              relationTo: "media",
              label: "Fichier PDF de présentation",
              required: false,
              admin: {
                description:
                  "Importez un PDF dans « Médias publics », puis sélectionnez-le ici. Un seul fichier pour toutes les langues.",
              },
            },
            {
              name: "intro",
              type: "textarea",
              label: "Texte d’introduction",
              ...LOCALIZED,
            },
            {
              name: "downloadLabel",
              type: "text",
              label: "Libellé du bouton de téléchargement",
              defaultValue: "Télécharger le dossier",
              ...LOCALIZED,
            },
          ],
        },
      ],
    },
  ],
};
