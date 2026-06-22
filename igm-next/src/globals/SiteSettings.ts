import type { GlobalConfig } from "payload";

import { isAdmin } from "../access/isAdmin";
import { footerLinkFields, headerNavField } from "../fields/navMenuFields";
import { LOCALIZED } from "../fields/localized";
import { revalidateFrontGlobal } from "../hooks/revalidateFront";

export const SiteSettings: GlobalConfig = {
  slug: "site-settings",
  label: "Paramètres du site",
  admin: {
    description: "Coordonnées, menu header et colonnes du pied de page (FR / EN).",
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
          label: "Général",
          fields: [
            {
              name: "siteName",
              type: "text",
              label: "Nom du site",
              defaultValue: "IGM",
              required: true,
              ...LOCALIZED,
            },
            {
              name: "phoneVert",
              type: "text",
              label: "Numéro vert (header)",
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
              label: "Adresse (texte libre)",
              ...LOCALIZED,
            },
            {
              name: "logo",
              type: "upload",
              relationTo: "media",
              label: "Logo",
            },
          ],
        },
        {
          label: "Menu header",
          fields: [headerNavField],
        },
        {
          label: "Pied de page",
          fields: [
            {
              name: "footerHqHeading",
              type: "text",
              label: "Titre adresse (colonne gauche)",
              defaultValue: "Adresse du siège",
              ...LOCALIZED,
            },
            {
              name: "footerHqText",
              type: "textarea",
              label: "Adresse complète",
              ...LOCALIZED,
            },
            {
              name: "footerColumns",
              type: "array",
              label: "Colonnes de liens",
              labels: { singular: "Colonne", plural: "Colonnes" },
              admin: {
                description: "Ex. Organes, Liens utiles. Laissez vide pour le contenu par défaut.",
                initCollapsed: true,
              },
              fields: [
                {
                  name: "title",
                  type: "text",
                  label: "Titre de colonne",
                  required: true,
                  ...LOCALIZED,
                },
                {
                  name: "links",
                  type: "array",
                  label: "Liens",
                  fields: footerLinkFields,
                },
              ],
            },
            {
              name: "footerContactTitle",
              type: "text",
              label: "Titre bloc contact",
              defaultValue: "Contact",
              ...LOCALIZED,
            },
            {
              name: "footerContactLead",
              type: "textarea",
              label: "Texte bloc contact",
              ...LOCALIZED,
            },
            {
              name: "footerContactPhone",
              type: "text",
              label: "Téléphone pied de page",
              defaultValue: "+243 900 030 005",
            },
            {
              name: "footerContactEmail",
              type: "email",
              label: "Email pied de page",
              admin: {
                description: "Laisser vide pour utiliser l’email général.",
              },
            },
            {
              name: "footerSocialTitle",
              type: "text",
              label: "Titre réseaux sociaux",
              defaultValue: "Réseaux sociaux",
              ...LOCALIZED,
            },
            {
              name: "footerSocial",
              type: "array",
              label: "Réseaux sociaux",
              admin: { initCollapsed: true },
              fields: [
                {
                  name: "network",
                  type: "select",
                  label: "Réseau",
                  required: true,
                  options: [
                    { label: "Facebook", value: "facebook" },
                    { label: "LinkedIn", value: "linkedin" },
                    { label: "YouTube", value: "youtube" },
                    { label: "Instagram", value: "instagram" },
                    { label: "X (Twitter)", value: "x" },
                  ],
                },
                {
                  name: "url",
                  type: "text",
                  label: "URL",
                  required: true,
                },
              ],
            },
            {
              name: "footerLegalLinks",
              type: "array",
              label: "Liens légaux (bas de page)",
              fields: footerLinkFields,
            },
            {
              name: "footerCopyright",
              type: "text",
              label: "Copyright",
              ...LOCALIZED,
              admin: {
                description: "Ex. « Copyright 2026 IGM | All Right Reserved. »",
              },
            },
          ],
        },
      ],
    },
  ],
};
