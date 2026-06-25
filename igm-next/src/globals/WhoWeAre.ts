import type { GlobalConfig } from "payload";

import { isAdmin } from "../access/isAdmin";
import { bannerCtaFields } from "../fields/bannerCtaFields";
import { LOCALIZED } from "../fields/localized";
import { revalidateFrontGlobal } from "../hooks/revalidateFront";

export const WhoWeAre: GlobalConfig = {
  slug: "who-we-are",
  label: "Page À propos",
  admin: {
    description:
      "Contenu éditorial de la page Qui sommes-nous (/a-propos). Renseignez chaque section en français et en anglais.",
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
              defaultValue: "Qui sommes-nous ? — IGM",
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
          label: "Introduction",
          fields: [
            {
              name: "headline",
              type: "textarea",
              label: "Titre principal",
              admin: {
                description: "Grand titre en haut de page (colonne gauche).",
              },
              ...LOCALIZED,
            },
            {
              name: "intro",
              type: "textarea",
              label: "Texte d'introduction",
              admin: {
                description: "Texte d'accroche (colonne droite).",
              },
              ...LOCALIZED,
            },
            {
              name: "heroImage",
              type: "upload",
              relationTo: "media",
              label: "Image principale",
            },
            {
              type: "row",
              fields: [
                {
                  name: "navAboutLabel",
                  type: "text",
                  label: "Libellé nav — À propos",
                  defaultValue: "À propos",
                  ...LOCALIZED,
                },
                {
                  name: "navHistoryLabel",
                  type: "text",
                  label: "Libellé nav — Historique",
                  defaultValue: "Historique",
                  ...LOCALIZED,
                },
                {
                  name: "navMissionLabel",
                  type: "text",
                  label: "Libellé nav — Mission",
                  defaultValue: "Mission",
                  ...LOCALIZED,
                },
              ],
            },
          ],
        },
        {
          label: "À propos",
          fields: [
            {
              type: "group",
              name: "aboutSection",
              label: "Section À propos",
              fields: [
                {
                  name: "title",
                  type: "text",
                  label: "Titre de section",
                  defaultValue: "À propos de l'IGM",
                  ...LOCALIZED,
                },
                {
                  name: "body",
                  type: "textarea",
                  label: "Corps de texte",
                  admin: {
                    description: "Un paragraphe par ligne.",
                  },
                  ...LOCALIZED,
                },
                {
                  name: "image",
                  type: "upload",
                  relationTo: "media",
                  label: "Image (optionnelle)",
                },
                {
                  type: "group",
                  name: "quote",
                  label: "Citation",
                  fields: [
                    { name: "text", type: "textarea", label: "Citation", ...LOCALIZED },
                    { name: "authorName", type: "text", label: "Auteur", ...LOCALIZED },
                    { name: "authorRole", type: "text", label: "Fonction", ...LOCALIZED },
                    {
                      name: "authorPhoto",
                      type: "upload",
                      relationTo: "media",
                      label: "Photo auteur",
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: "Historique",
          fields: [
            {
              type: "group",
              name: "historySection",
              label: "Section Historique",
              fields: [
                {
                  name: "title",
                  type: "text",
                  label: "Titre",
                  defaultValue: "Historique",
                  ...LOCALIZED,
                },
                {
                  name: "lead",
                  type: "textarea",
                  label: "Chapô",
                  ...LOCALIZED,
                },
                {
                  name: "body",
                  type: "textarea",
                  label: "Texte",
                  admin: {
                    description:
                      "Un paragraphe par ligne. Lignes commençant par « • » pour les listes. Liens : [libellé](/chemin).",
                  },
                  ...LOCALIZED,
                },
              ],
            },
          ],
        },
        {
          label: "Mission",
          fields: [
            {
              type: "group",
              name: "missionSection",
              label: "Section Mission",
              fields: [
                {
                  name: "title",
                  type: "text",
                  label: "Titre",
                  defaultValue: "Mission",
                  ...LOCALIZED,
                },
                {
                  name: "lead",
                  type: "textarea",
                  label: "Chapô",
                  ...LOCALIZED,
                },
                {
                  name: "headline",
                  type: "text",
                  label: "Sous-titre",
                  defaultValue: "Ensemble, nous renforçons la gouvernance minière",
                  ...LOCALIZED,
                },
                {
                  name: "body",
                  type: "textarea",
                  label: "Texte descriptif",
                  admin: { description: "Un paragraphe par ligne." },
                  ...LOCALIZED,
                },
                {
                  name: "statutoryTitle",
                  type: "text",
                  label: "Titre — missions statutaires",
                  defaultValue: "Missions statutaires",
                  ...LOCALIZED,
                },
                {
                  name: "statutoryItems",
                  type: "array",
                  label: "Missions statutaires",
                  fields: [{ name: "label", type: "text", label: "Libellé", required: true, ...LOCALIZED }],
                },
                {
                  name: "prioritiesTitle",
                  type: "text",
                  label: "Titre — priorités",
                  defaultValue: "Priorités actuelles",
                  ...LOCALIZED,
                },
                {
                  name: "priorities",
                  type: "array",
                  label: "Priorités",
                  fields: [{ name: "label", type: "text", label: "Libellé", required: true, ...LOCALIZED }],
                },
              ],
            },
          ],
        },
        {
          label: "Chiffres clés",
          fields: [
            {
              type: "group",
              name: "statsSection",
              label: "Statistiques",
              fields: [
                {
                  name: "items",
                  type: "array",
                  label: "Indicateurs",
                  maxRows: 4,
                  fields: [
                    { name: "label", type: "text", label: "Libellé", required: true, ...LOCALIZED },
                    { name: "value", type: "text", label: "Valeur", required: true, ...LOCALIZED },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: "Équipe",
          fields: [
            {
              type: "group",
              name: "teamSection",
              label: "Section équipe",
              fields: [
                {
                  name: "title",
                  type: "text",
                  label: "Titre",
                  defaultValue: "Notre équipe de direction",
                  ...LOCALIZED,
                },
                {
                  name: "lead",
                  type: "textarea",
                  label: "Chapô",
                  ...LOCALIZED,
                },
                {
                  name: "members",
                  type: "array",
                  label: "Membres",
                  fields: [
                    { name: "name", type: "text", label: "Nom", required: true, ...LOCALIZED },
                    { name: "role", type: "text", label: "Fonction", ...LOCALIZED },
                    {
                      name: "photo",
                      type: "upload",
                      relationTo: "media",
                      label: "Photo",
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: "Appel à l'action",
          fields: [
            {
              type: "group",
              name: "ctaSection",
              label: "Bloc CTA",
              fields: [
                { name: "title", type: "text", label: "Titre", ...LOCALIZED },
                { name: "text", type: "textarea", label: "Texte", ...LOCALIZED },
                {
                  type: "group",
                  name: "link",
                  label: "Lien",
                  fields: bannerCtaFields,
                },
              ],
            },
          ],
        },
        {
          label: "Contact",
          fields: [
            {
              type: "group",
              name: "contactSection",
              label: "Bandeau contact",
              fields: [
                { name: "title", type: "text", label: "Titre", ...LOCALIZED },
                { name: "lead", type: "textarea", label: "Texte", ...LOCALIZED },
                {
                  type: "group",
                  name: "primaryCta",
                  label: "Bouton principal",
                  fields: bannerCtaFields,
                },
                { name: "phoneLabel", type: "text", label: "Téléphone affiché", ...LOCALIZED },
                { name: "phoneHref", type: "text", label: "Lien téléphone", defaultValue: "tel:+243976844563" },
                {
                  name: "image",
                  type: "upload",
                  relationTo: "media",
                  label: "Image",
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};
