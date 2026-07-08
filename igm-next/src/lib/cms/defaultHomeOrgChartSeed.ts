import type { CmsHomeOrgChartSection } from "./home/types";

export const DEFAULT_HOME_ORG_CHART_FR: CmsHomeOrgChartSection = {
  titlePrefix: "Notre",
  titleHighlight: "organigramme",
  titleSuffix: "institutionnel.",
  lead:
    "L'IGM est structurée autour de l'Inspecteur général et de l'Inspecteur général adjoint, de cellules et coordinations d'appui, puis de départements et services opérationnels, avec l'inspection provinciale des mines.",
  units: [
    {
      name: "Inspecteur général",
      role: "Direction de l'institution",
    },
    {
      name: "Inspecteur général adjoint",
      role: "Assistance à la direction",
    },
    {
      name: "Cellules & coordinations",
      role: "CelCom, CPM, CPRP, CIG, CIP, CAI",
    },
    {
      name: "Départements centraux",
      role: "DIT, DIJ, DREIO, DAF, DITIC",
    },
    {
      name: "Inspection provinciale des mines",
      role: "Déploiement territorial",
    },
  ],
  ctaSidebarTitle: "Texte fondateur",
  ctaLabel: "Consulter l'organigramme",
  ctaHref: "/organigramme",
};

export const DEFAULT_HOME_ORG_CHART_EN: CmsHomeOrgChartSection = {
  titlePrefix: "Our",
  titleHighlight: "organizational",
  titleSuffix: "chart.",
  lead:
    "The IGM is structured around the Inspector General and Deputy Inspector General, support units and coordinations, operational departments and services, and provincial mine inspection.",
  units: [
    {
      name: "Inspector General",
      role: "Institutional leadership",
    },
    {
      name: "Deputy Inspector General",
      role: "Executive support",
    },
    {
      name: "Units & coordinations",
      role: "CelCom, CPM, CPRP, CIG, CIP, CAI",
    },
    {
      name: "Central departments",
      role: "DIT, DIJ, DREIO, DAF, DITIC",
    },
    {
      name: "Provincial mine inspection",
      role: "Territorial deployment",
    },
  ],
  ctaSidebarTitle: "Founding decree",
  ctaLabel: "View org chart",
  ctaHref: "/organigramme",
};
