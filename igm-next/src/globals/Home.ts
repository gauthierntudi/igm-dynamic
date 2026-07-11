import type { GlobalConfig } from "payload";

import { isAdmin } from "../access/isAdmin";
import { bannerCtaFields } from "../fields/bannerCtaFields";
import { LOCALIZED } from "../fields/localized";
import { revalidateFrontGlobal } from "../hooks/revalidateFront";

export const Home: GlobalConfig = {
  slug: "home",
  label: "Page d'accueil",
  admin: {
    description:
      "Contenu éditorial de la page d'accueil. Renseignez chaque section en français et en anglais (onglets FR / EN).",
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
              label: "Titre de la page",
              defaultValue: "IGM — Inspection Générale des Mines",
              ...LOCALIZED,
            },
            {
              name: "seoDescription",
              type: "textarea",
              label: "Description",
              ...LOCALIZED,
            },
          ],
        },
        {
          label: "Bannière",
          fields: [
            {
              name: "bannerSlides",
              type: "array",
              label: "Diapositives",
              labels: { singular: "Diapositive", plural: "Diapositives" },
              admin: {
                initCollapsed: true,
                components: {
                  RowLabel: "@/components/admin/BannerSlideRowLabel#BannerSlideRowLabel",
                },
              },
              fields: [
                {
                  name: "adminLabel",
                  type: "text",
                  label: "Nom de la diapositive",
                  admin: {
                    description:
                      "Libellé affiché dans la liste (ex. « Accueil — Mission »). Laissez vide pour utiliser le titre ou « Diapositive 01 ».",
                    placeholder: "Ex. Accueil — Mission",
                  },
                },
                {
                  name: "slideType",
                  type: "select",
                  label: "Type",
                  defaultValue: "image",
                  options: [
                    { label: "Image", value: "image" },
                    { label: "Vidéo", value: "video" },
                  ],
                },
                {
                  name: "image",
                  type: "upload",
                  relationTo: "media",
                  label: "Image de fond",
                },
                {
                  name: "video",
                  type: "upload",
                  relationTo: "media",
                  label: "Vidéo de fond",
                  admin: {
                    condition: (_, siblingData) => siblingData?.slideType === "video",
                  },
                },
                { name: "badge", type: "text", label: "Badge", ...LOCALIZED },
                { name: "title", type: "text", label: "Titre", required: true, ...LOCALIZED },
                { name: "lead", type: "textarea", label: "Texte", ...LOCALIZED },
                {
                  name: "features",
                  type: "array",
                  label: "Points forts",
                  fields: [{ name: "label", type: "text", label: "Libellé", ...LOCALIZED }],
                },
                {
                  type: "row",
                  fields: [
                    { name: "primaryCta", type: "group", label: "Bouton principal", fields: bannerCtaFields },
                    { name: "secondaryCta", type: "group", label: "Bouton secondaire", fields: bannerCtaFields },
                  ],
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
              name: "about",
              label: "Section à propos",
              fields: [
                { name: "title", type: "text", label: "Titre principal", ...LOCALIZED },
                { name: "leadText", type: "textarea", label: "Chapô", ...LOCALIZED },
                { name: "detailText", type: "textarea", label: "Texte détaillé", ...LOCALIZED },
                {
                  type: "row",
                  fields: [
                    { name: "signatureName", type: "text", label: "Nom (signature)", ...LOCALIZED },
                    { name: "signatureRole", type: "text", label: "Fonction", ...LOCALIZED },
                  ],
                },
                {
                  name: "image",
                  type: "upload",
                  relationTo: "media",
                  label: "Photo",
                },
              ],
            },
          ],
        },
        {
          label: "Stratégie",
          fields: [
            {
              type: "group",
              name: "strategy",
              label: "Section stratégie",
              fields: [
                {
                  name: "video",
                  type: "upload",
                  relationTo: "media",
                  label: "Vidéo de fond",
                  admin: {
                    description:
                      "Vidéo en arrière-plan de la section (MP4 recommandé). Laissez vide pour la vidéo par défaut.",
                  },
                },
                {
                  name: "title",
                  type: "text",
                  label: "Titre (colonne 1)",
                  defaultValue: "Stratégie de déploiement",
                  ...LOCALIZED,
                },
                {
                  name: "lead",
                  type: "textarea",
                  label: "Introduction (colonne 1)",
                  defaultValue: "À travers cette stratégie, l'IGM ambitionne de :",
                  ...LOCALIZED,
                },
                {
                  name: "ambitions",
                  type: "array",
                  label: "Ambitions (colonne 1)",
                  labels: { singular: "Ambition", plural: "Ambitions" },
                  fields: [
                    {
                      name: "label",
                      type: "text",
                      label: "Libellé",
                      required: true,
                      ...LOCALIZED,
                    },
                  ],
                },
                {
                  name: "axesTitle",
                  type: "text",
                  label: "Titre liste (colonne 2)",
                  defaultValue: "Axes stratégiques :",
                  ...LOCALIZED,
                },
                {
                  name: "axes",
                  type: "array",
                  label: "Axes (colonne 2)",
                  labels: { singular: "Axe", plural: "Axes" },
                  fields: [
                    {
                      name: "label",
                      type: "text",
                      label: "Libellé",
                      required: true,
                      ...LOCALIZED,
                    },
                  ],
                },
                {
                  type: "row",
                  fields: [
                    {
                      name: "ctaLabel",
                      type: "text",
                      label: "Bouton (colonne 3)",
                      defaultValue: "Consulter notre stratégie",
                      ...LOCALIZED,
                    },
                    {
                      name: "ctaHref",
                      type: "text",
                      label: "Lien bouton",
                      defaultValue: "/contact",
                      ...LOCALIZED,
                    },
                  ],
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
              label: "En-tête section chiffres",
              admin: {
                description: "Les valeurs des compteurs sont gérées dans la collection « Chiffres clés ».",
              },
              fields: [
                { name: "title", type: "text", label: "Titre", ...LOCALIZED },
                { name: "lead", type: "textarea", label: "Introduction", ...LOCALIZED },
              ],
            },
          ],
        },
        {
          label: "Partenaires",
          fields: [
            {
              type: "group",
              name: "partnersSection",
              label: "Section partenaires",
              fields: [
                {
                  name: "title",
                  type: "text",
                  label: "Titre",
                  defaultValue: "- Nos Partenaires -",
                  ...LOCALIZED,
                },
                {
                  name: "partners",
                  type: "array",
                  label: "Logos partenaires",
                  labels: { singular: "Partenaire", plural: "Partenaires" },
                  admin: {
                    initCollapsed: true,
                  },
                  fields: [
                    {
                      name: "name",
                      type: "text",
                      label: "Nom (accessibilité)",
                      required: true,
                      ...LOCALIZED,
                    },
                    {
                      name: "logo",
                      type: "upload",
                      relationTo: "media",
                      label: "Logo (thème clair)",
                      required: true,
                    },
                    {
                      name: "logoDark",
                      type: "upload",
                      relationTo: "media",
                      label: "Logo (thème sombre)",
                      admin: {
                        description: "Optionnel — réutilise le logo clair si vide.",
                      },
                    },
                    {
                      name: "url",
                      type: "text",
                      label: "Lien (optionnel)",
                      admin: {
                        description: "URL complète (https://…) ou chemin interne (/contact).",
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: "Action terrain",
          fields: [
            {
              type: "group",
              name: "actionSection",
              label: "Section action sur le terrain",
              fields: [
                {
                  type: "row",
                  fields: [
                    {
                      name: "titlePrefix",
                      type: "text",
                      label: "Titre — début",
                      defaultValue: "Notre",
                      ...LOCALIZED,
                    },
                    {
                      name: "titleHighlight",
                      type: "text",
                      label: "Titre — mot en gras",
                      defaultValue: "action",
                      ...LOCALIZED,
                    },
                    {
                      name: "titleSuffix",
                      type: "text",
                      label: "Titre — fin",
                      defaultValue: "sur le terrain.",
                      ...LOCALIZED,
                    },
                  ],
                },
                { name: "lead", type: "textarea", label: "Introduction", ...LOCALIZED },
                {
                  name: "items",
                  type: "array",
                  label: "Cartes",
                  labels: { singular: "Carte", plural: "Cartes" },
                  admin: { initCollapsed: true },
                  fields: [
                    {
                      name: "title",
                      type: "textarea",
                      label: "Titre",
                      required: true,
                      admin: {
                        description: "Saut de ligne pour un retour à la ligne dans le titre.",
                      },
                      ...LOCALIZED,
                    },
                    {
                      name: "text",
                      type: "textarea",
                      label: "Texte",
                      required: true,
                      ...LOCALIZED,
                    },
                  ],
                },
                { name: "ctaLead", type: "text", label: "Texte au-dessus du bouton", ...LOCALIZED },
                {
                  type: "row",
                  fields: [
                    {
                      name: "ctaLabel",
                      type: "text",
                      label: "Bouton",
                      defaultValue: "Contactez-nous",
                      ...LOCALIZED,
                    },
                    {
                      name: "ctaHref",
                      type: "text",
                      label: "Lien bouton",
                      defaultValue: "/contact",
                      ...LOCALIZED,
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: "Organigramme",
          fields: [
            {
              type: "group",
              name: "orgChartSection",
              label: "Section organigramme (accueil)",
              admin: {
                description:
                  "Remplace l’ancienne section équipe. Le fond bleu du thème est conservé.",
              },
              fields: [
                {
                  type: "row",
                  fields: [
                    {
                      name: "titlePrefix",
                      type: "text",
                      label: "Titre — début",
                      defaultValue: "Notre",
                      ...LOCALIZED,
                    },
                    {
                      name: "titleHighlight",
                      type: "text",
                      label: "Titre — mot en gras",
                      defaultValue: "organigramme",
                      ...LOCALIZED,
                    },
                    {
                      name: "titleSuffix",
                      type: "text",
                      label: "Titre — fin",
                      defaultValue: "institutionnel.",
                      ...LOCALIZED,
                    },
                  ],
                },
                { name: "lead", type: "textarea", label: "Introduction", ...LOCALIZED },
                {
                  name: "diagram",
                  type: "upload",
                  relationTo: "media",
                  label: "Schéma organigramme (optionnel)",
                  admin: {
                    description:
                      "Image du schéma complet. Si vide, le schéma officiel du Décret n° 23/19 est affiché automatiquement.",
                  },
                },
                {
                  name: "units",
                  type: "array",
                  label: "Postes / directions",
                  labels: { singular: "Entrée", plural: "Entrées" },
                  admin: { initCollapsed: true },
                  fields: [
                    { name: "name", type: "text", label: "Nom ou intitulé", required: true, ...LOCALIZED },
                    { name: "role", type: "text", label: "Fonction / description", required: true, ...LOCALIZED },
                    {
                      name: "image",
                      type: "upload",
                      relationTo: "media",
                      label: "Photo (optionnelle)",
                    },
                  ],
                },
                {
                  name: "ctaSidebarTitle",
                  type: "text",
                  label: "Titre encart latéral",
                  defaultValue: "Structure institutionnelle",
                  ...LOCALIZED,
                },
                {
                  type: "row",
                  fields: [
                    {
                      name: "ctaLabel",
                      type: "text",
                      label: "Bouton",
                      defaultValue: "Voir l'organigramme complet",
                      ...LOCALIZED,
                    },
                    {
                      name: "ctaHref",
                      type: "text",
                      label: "Lien bouton",
                      defaultValue: "/organigramme",
                      ...LOCALIZED,
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: "Actualités",
          fields: [
            {
              type: "group",
              name: "newsSection",
              label: "Section actualités",
              fields: [
                {
                  name: "title",
                  type: "text",
                  label: "Titre",
                  defaultValue: "Dernières actualités.",
                  ...LOCALIZED,
                },
                { name: "lead", type: "textarea", label: "Introduction", ...LOCALIZED },
                {
                  name: "maxItems",
                  type: "number",
                  label: "Nombre d'articles",
                  defaultValue: 4,
                  min: 1,
                  max: 6,
                  admin: {
                    description: "Articles récents affichés sur la page d'accueil (publiés uniquement).",
                  },
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
              label: "Section contact (fin de page d'accueil)",
              admin: {
                description:
                  "Titre, texte, bouton et galerie d'images/vidéos affichés en bas de la page d'accueil. Renseignez le contenu en français et en anglais.",
              },
              fields: [
                {
                  name: "title",
                  type: "text",
                  label: "Titre",
                  defaultValue: "Dénoncer un abus ?",
                  ...LOCALIZED,
                },
                {
                  name: "lead",
                  type: "textarea",
                  label: "Texte",
                  defaultValue: "Irrégularité constatée ? Contactez l'IGM.",
                  ...LOCALIZED,
                },
                {
                  name: "buttonLabel",
                  type: "text",
                  label: "Libellé du bouton",
                  defaultValue: "Dénoncer",
                  ...LOCALIZED,
                },
                {
                  name: "buttonHref",
                  type: "text",
                  label: "Lien du bouton",
                  defaultValue: "/denoncer",
                  ...LOCALIZED,
                  admin: {
                    description:
                      "Chemin interne (ex. /denoncer, /contact) ou URL absolue. Les liens « dénoncer » ouvrent la modale signalement.",
                  },
                },
                {
                  name: "gallery",
                  type: "array",
                  label: "Galerie médias",
                  labels: { singular: "Média", plural: "Médias" },
                  admin: {
                    initCollapsed: true,
                    description:
                      "Images et vidéos à côté du bouton. L'ordre définit l'affichage. Si vide, les visuels par défaut du thème sont utilisés.",
                  },
                  fields: [
                    {
                      name: "kind",
                      type: "select",
                      label: "Type",
                      defaultValue: "image",
                      options: [
                        { label: "Image", value: "image" },
                        { label: "Vidéo", value: "video" },
                      ],
                    },
                    {
                      name: "image",
                      type: "upload",
                      relationTo: "media",
                      label: "Image",
                      admin: {
                        condition: (_, siblingData) => siblingData?.kind !== "video",
                      },
                    },
                    {
                      name: "video",
                      type: "upload",
                      relationTo: "media",
                      label: "Vidéo",
                      admin: {
                        condition: (_, siblingData) => siblingData?.kind === "video",
                      },
                    },
                    {
                      name: "displayWidth",
                      type: "number",
                      label: "Largeur affichée (px)",
                      min: 80,
                      max: 400,
                      admin: {
                        description: "Optionnel — ex. 150 ou 190 selon la taille souhaitée.",
                      },
                    },
                    {
                      name: "alt",
                      type: "text",
                      label: "Texte alternatif (image)",
                      ...LOCALIZED,
                      admin: {
                        condition: (_, siblingData) => siblingData?.kind !== "video",
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};
