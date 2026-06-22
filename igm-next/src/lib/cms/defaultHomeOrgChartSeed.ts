import type { CmsHomeOrgChartSection } from "./home/types";

export const DEFAULT_HOME_ORG_CHART_FR: CmsHomeOrgChartSection = {
  titlePrefix: "Notre",
  titleHighlight: "organigramme",
  titleSuffix: "institutionnel.",
  lead:
    "Conformément au Décret n° 23/19 du 09 juin 2023, l'IGM est structurée en administration centrale (Kinshasa) et administration provinciale, sous la direction de l'Inspecteur général et de l'Inspecteur général adjoint.",
  units: [
    {
      name: "Inspecteur général",
      role: "Planification, supervision, coordination et contrôle (art. 10)",
    },
    {
      name: "Inspecteur général adjoint",
      role: "Assistance à la direction et intérim (art. 11)",
    },
    {
      name: "Administration centrale",
      role: "Inspection générale, départements et services (art. 7)",
    },
    {
      name: "Inspection générale",
      role: "Pôle central de l'administration à Kinshasa",
    },
    {
      name: "Administration provinciale",
      role: "Inspection provinciale, brigades et antennes (art. 8)",
    },
    {
      name: "Inspection provinciale",
      role: "Coordination et contrôle des activités en province (art. 12-13)",
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
    "Under Decree No. 23/19 of 9 June 2023, the IGM is structured into central administration (Kinshasa) and provincial administration, led by the Inspector General and Deputy Inspector General.",
  units: [
    {
      name: "Inspector General",
      role: "Planning, supervision, coordination and control (Art. 10)",
    },
    {
      name: "Deputy Inspector General",
      role: "Executive support and acting role (Art. 11)",
    },
    {
      name: "Central administration",
      role: "General inspection, departments and services (Art. 7)",
    },
    {
      name: "General inspection",
      role: "Central hub at the Kinshasa headquarters",
    },
    {
      name: "Provincial administration",
      role: "Provincial inspection, brigades and field units (Art. 8)",
    },
    {
      name: "Provincial inspection",
      role: "Coordination and oversight of provincial activities (Art. 12-13)",
    },
  ],
  ctaSidebarTitle: "Founding decree",
  ctaLabel: "View org chart",
  ctaHref: "/organigramme",
};
