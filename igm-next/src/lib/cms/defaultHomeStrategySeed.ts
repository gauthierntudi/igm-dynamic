import type { CmsHomeStrategy } from "./home/types";

export const DEFAULT_HOME_STRATEGY_FR: CmsHomeStrategy = {
  title: "Stratégie de déploiement",
  lead: "À travers cette stratégie, l'IGM ambitionne de :",
  ambitions: [
    { label: "Renforcer la souveraineté minière de l'État" },
    { label: "Garantir une exploitation responsable et durable" },
    { label: "Protéger les ressources naturelles" },
    { label: "Accroître les recettes publiques" },
    { label: "Assurer la transparence et la traçabilité du secteur" },
  ],
  axesTitle: "Axes stratégiques :",
  axes: [
    { label: "Opérationnalisation nationale" },
    { label: "Digitalisation & Traçabilité" },
    { label: "Lutte contre la fraude et la contrebande" },
    { label: "Audits de conformité sociale & environnementale" },
  ],
  ctaLabel: "Consulter notre stratégie",
  ctaHref: "/contact",
};

export const DEFAULT_HOME_STRATEGY_EN: CmsHomeStrategy = {
  title: "Deployment strategy",
  lead: "Through this strategy, the IGM aims to:",
  ambitions: [
    { label: "Strengthen the State's mining sovereignty" },
    { label: "Ensure responsible and sustainable exploitation" },
    { label: "Protect natural resources" },
    { label: "Increase public revenue" },
    { label: "Ensure transparency and traceability in the sector" },
  ],
  axesTitle: "Strategic pillars:",
  axes: [
    { label: "Nationwide operational rollout" },
    { label: "Digitalisation & traceability" },
    { label: "Fight against fraud and smuggling" },
    { label: "Social & environmental compliance audits" },
  ],
  ctaLabel: "View our strategy",
  ctaHref: "/contact",
};
