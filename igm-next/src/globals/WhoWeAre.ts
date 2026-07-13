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
              name: "heroTitle",
              type: "text",
              label: "Titre de la bannière (H1)",
              admin: {
                description:
                  "Titre principal affiché dans le bandeau et dans le fil d'Ariane sur /a-propos.",
              },
              defaultValue: "Qui sommes-nous ?",
              ...LOCALIZED,
            },
            {
              name: "headline",
              type: "textarea",
              label: "Sous-titre de la bannière",
              admin: {
                description: "Optionnel. Laisser vide pour n'afficher aucun sous-titre.",
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
              label: "Image bannière (haut de page)",
              admin: {
                description: "Fond du bandeau principal sur /a-propos (et repli sur /historique si non renseigné).",
              },
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
                  admin: {
                    description: "Optionnel. Laisser vide pour n'afficher aucun titre.",
                  },
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
                  label: "Image section À propos",
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
                  admin: {
                    description: "Optionnel. Laisser vide pour n'afficher aucun titre.",
                  },
                  ...LOCALIZED,
                },
                {
                  name: "headline",
                  type: "text",
                  label: "Accroche hero",
                  admin: {
                    description: "Phrase courte affichée dans le bandeau (max. ~70 caractères).",
                  },
                  ...LOCALIZED,
                },
                {
                  name: "lead",
                  type: "textarea",
                  label: "Chapô avant la frise (/a-propos)",
                  admin: {
                    description:
                      "Optionnel. Court texte d'introduction affiché au-dessus de la frise chronologique sur /a-propos.",
                  },
                  ...LOCALIZED,
                },
                {
                  name: "timelineIntro",
                  type: "textarea",
                  label: "Texte d'introduction avant la frise (/a-propos)",
                  admin: {
                    description:
                      "Optionnel. Un paragraphe par ligne. Lignes « • » pour les listes. Liens : [libellé](/chemin).",
                  },
                  ...LOCALIZED,
                },
                {
                  name: "body",
                  type: "textarea",
                  label: "Texte page Historique (/historique)",
                  admin: {
                    description:
                      "Un paragraphe par ligne. Lignes commençant par « • » pour les listes. Liens : [libellé](/chemin).",
                  },
                  ...LOCALIZED,
                },
                {
                  name: "milestones",
                  type: "array",
                  label: "Frise chronologique (/a-propos)",
                  admin: {
                    description:
                      "Événements affichés dans la frise horizontale sur /a-propos. Cliquer sur l'année ou le titre ouvre la description.",
                  },
                  fields: [
                    {
                      name: "year",
                      type: "text",
                      label: "Date de l'événement",
                      admin: {
                        description:
                          "Date complète localisée (ex. FR : 9 mars 2018 — EN : 9 March 2018). L'année s'affiche sur la frise ; la date entière dans le modal.",
                      },
                      ...LOCALIZED,
                    },
                    {
                      name: "title",
                      type: "text",
                      label: "Titre de l'événement",
                      ...LOCALIZED,
                    },
                    {
                      name: "segmentColor",
                      type: "text",
                      label: "Couleur du segment",
                      admin: {
                        description:
                          "Fond du segment de la frise (hex, ex. #1b4491). Laisser vide pour le dégradé bleu automatique.",
                        width: "50%",
                      },
                    },
                    {
                      name: "bubbleColor",
                      type: "text",
                      label: "Couleur du cercle",
                      admin: {
                        description:
                          "Bordure et fond au survol du cercle (hex). Laisser vide pour reprendre la couleur du segment.",
                        width: "50%",
                      },
                    },
                    {
                      name: "text",
                      type: "textarea",
                      label: "Description (modal)",
                      admin: {
                        description: "Texte affiché dans la fenêtre au clic sur l'année ou le titre.",
                      },
                      ...LOCALIZED,
                    },
                    {
                      name: "link",
                      type: "group",
                      label: "Lien optionnel (modal)",
                      admin: {
                        description:
                          "Bouton affiché sous la description si le libellé et la destination sont renseignés.",
                      },
                      fields: bannerCtaFields,
                    },
                  ],
                },
                {
                  name: "heroImage",
                  type: "upload",
                  relationTo: "media",
                  label: "Bannière page Historique",
                  admin: {
                    description: "Fond du bandeau en haut de /historique. Repli : bannière Introduction.",
                  },
                },
                {
                  name: "ctaImage",
                  type: "upload",
                  relationTo: "media",
                  label: "Bandeau bas de page (CTA)",
                  admin: {
                    description: "Image de fond du bandeau « acteur central » en bas de /historique.",
                  },
                },
                {
                  name: "teaserImage1",
                  type: "upload",
                  relationTo: "media",
                  label: "Galerie À propos — image 1",
                  admin: {
                    description: "Première vignette de la section Historique sur /a-propos.",
                  },
                },
                {
                  name: "teaserImage2",
                  type: "upload",
                  relationTo: "media",
                  label: "Galerie À propos — image 2",
                  admin: {
                    description: "Deuxième vignette de la section Historique sur /a-propos.",
                  },
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
                  name: "image",
                  type: "upload",
                  relationTo: "media",
                  label: "Image section Mission",
                  admin: {
                    description: "Grande image à gauche du bloc Mission sur /a-propos.",
                  },
                },
                {
                  name: "title",
                  type: "text",
                  label: "Titre",
                  admin: {
                    description: "Optionnel. Laisser vide pour n'afficher aucun titre.",
                  },
                  ...LOCALIZED,
                },
                {
                  name: "lead",
                  type: "textarea",
                  label: "Chapô",
                  admin: {
                    description: "Optionnel. Laisser vide pour n'afficher aucun texte.",
                  },
                  ...LOCALIZED,
                },
                {
                  name: "headline",
                  type: "text",
                  label: "Sous-titre",
                  admin: {
                    description: "Optionnel. Laisser vide pour n'afficher aucun texte.",
                  },
                  ...LOCALIZED,
                },
                {
                  name: "body",
                  type: "textarea",
                  label: "Texte descriptif",
                  admin: {
                    description:
                      "Optionnel. Un paragraphe par ligne. Laisser vide pour n'afficher aucun texte.",
                  },
                  ...LOCALIZED,
                },
                {
                  name: "statutoryTitle",
                  type: "text",
                  label: "Titre — missions statutaires",
                  admin: {
                    description: "Optionnel. Laisser vide pour n'afficher aucun titre.",
                  },
                  ...LOCALIZED,
                },
                {
                  name: "statutoryItems",
                  type: "array",
                  label: "Missions statutaires",
                  fields: [{ name: "label", type: "text", label: "Libellé", ...LOCALIZED }],
                },
                {
                  name: "prioritiesTitle",
                  type: "text",
                  label: "Titre — priorités",
                  admin: {
                    description: "Optionnel. Laisser vide pour n'afficher aucun titre.",
                  },
                  ...LOCALIZED,
                },
                {
                  name: "priorities",
                  type: "array",
                  label: "Priorités",
                  fields: [{ name: "label", type: "text", label: "Libellé", ...LOCALIZED }],
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
                    { name: "label", type: "text", label: "Libellé", ...LOCALIZED },
                    { name: "value", type: "text", label: "Valeur", ...LOCALIZED },
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
                  admin: {
                    description: "Optionnel. Laisser vide pour n'afficher aucun titre.",
                  },
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
                    { name: "name", type: "text", label: "Nom", ...LOCALIZED },
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
                {
                  name: "title",
                  type: "text",
                  label: "Titre",
                  admin: {
                    description: "Optionnel. Laisser vide pour n'afficher aucun titre.",
                  },
                  ...LOCALIZED,
                },
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
                {
                  name: "title",
                  type: "text",
                  label: "Titre",
                  admin: {
                    description: "Optionnel. Laisser vide pour n'afficher aucun titre.",
                  },
                  ...LOCALIZED,
                },
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
