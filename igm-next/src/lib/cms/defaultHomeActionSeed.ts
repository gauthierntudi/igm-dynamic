import type { CmsHomeActionSection } from "./home/types";

export const DEFAULT_HOME_ACTION_FR: CmsHomeActionSection = {
  titlePrefix: "Notre",
  titleHighlight: "action",
  titleSuffix: "sur le terrain.",
  lead:
    "L'Inspection Générale des Mines assure le contrôle, la régulation et la supervision du secteur minier en RDC : lutte contre la fraude et la contrebande, assainissement de la chaîne de production et respect des normes sociales et environnementales.",
  items: [
    {
      title: "Opérationnalisation\nnationale",
      text: "Finalisation du recrutement des inspecteurs, déploiement dans les 22 provinces où l'IGM est implantée et transition complète avec l'ancienne inspection minière.",
    },
    {
      title: "Digitalisation\net traçabilité",
      text: "Modernisation du cadastre minier, digitalisation des flux de production et mise en place de systèmes de certification numérique pour plus de transparence.",
    },
    {
      title: "Lutte contre la\nfraude",
      text: "Missions ciblées dans les zones à risque, cartographie des circuits illégaux, démantèlement des réseaux frauduleux et renforcement des contrôles et sanctions.",
    },
    {
      title: "Gouvernance\net synergies",
      text: "Collaboration avec le CTCPM, le CAMI, la SAEMAPE et les gouvernements provinciaux pour harmoniser les données, organiser des missions conjointes et améliorer la gestion des redevances.",
    },
  ],
  ctaLead: "Partenariat, information ou presse : écrivez-nous.",
  ctaLabel: "Contactez-nous",
  ctaHref: "/contact",
};

export const DEFAULT_HOME_ACTION_EN: CmsHomeActionSection = {
  titlePrefix: "Our",
  titleHighlight: "field",
  titleSuffix: "action.",
  lead:
    "The General Mine Inspection ensures control, regulation and supervision of the mining sector in the DRC: fighting fraud and smuggling, cleaning up the production chain and enforcing social and environmental standards.",
  items: [
    {
      title: "Nationwide\noperational rollout",
      text: "Completing inspector recruitment, deployment across all 22 provinces where the IGM operates, and full transition from the former mining inspection body.",
    },
    {
      title: "Digitalisation\nand traceability",
      text: "Modernising the mining cadastre, digitising production flows and implementing digital certification systems for greater transparency.",
    },
    {
      title: "Fighting\nfraud",
      text: "Targeted missions in high-risk areas, mapping illegal circuits, dismantling fraudulent networks and strengthening controls and sanctions.",
    },
    {
      title: "Governance\nand synergies",
      text: "Working with CTCPM, CAMI, SAEMAPE and provincial governments to harmonise data, organise joint missions and improve royalty management.",
    },
  ],
  ctaLead: "Partnership, information or press enquiries: get in touch.",
  ctaLabel: "Contact us",
  ctaHref: "/contact",
};
