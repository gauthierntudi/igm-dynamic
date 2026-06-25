export type DefaultNewsArticleSeed = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  categoryCustom?: string;
  publishedAt: string;
  contentHtml: string;
};

export const DEFAULT_NEWS_FR: DefaultNewsArticleSeed[] = [
  {
    slug: "presence-igm-sites-miniers",
    title: "Renforcer la présence de l'IGM sur les sites miniers stratégiques.",
    excerpt:
      "Déploiement des équipes et coordination avec les autorités locales pour des contrôles plus réguliers et mieux documentés.",
    category: "inspection",
    publishedAt: "2026-01-08T10:00:00.000Z",
    contentHtml:
      "<p>L'Inspection Générale des Mines intensifie sa présence sur les sites miniers stratégiques afin de renforcer la conformité et la traçabilité des activités extractives.</p><p>Des équipes dédiées sont déployées en coordination avec les autorités provinciales pour des contrôles plus réguliers, documentés et partagés avec les partenaires institutionnels.</p>",
  },
  {
    slug: "modernisation-flux-information",
    title: "Moderniser les flux d'information pour une meilleure traçabilité.",
    excerpt:
      "Vers des procédures dématérialisées et des échanges sécurisés entre l'IGM, le CAMI et les opérateurs du secteur.",
    category: "digitalisation",
    publishedAt: "2025-12-22T10:00:00.000Z",
    contentHtml:
      "<p>La modernisation des flux d'information vise à fiabiliser les données minières et à accélérer les échanges entre l'IGM, le CAMI et les opérateurs.</p><p>Des procédures dématérialisées sont progressivement mises en place pour améliorer la traçabilité et la transparence du secteur.</p>",
  },
  {
    slug: "missions-fraude-contrebande",
    title: "Missions ciblées contre la fraude et la contrebande minière.",
    excerpt:
      "Cartographie des zones à risque et renforcement des sanctions pour protéger les redevances de l'État et les chaînes d'approvisionnement légales.",
    category: "conformite",
    publishedAt: "2025-11-05T10:00:00.000Z",
    contentHtml:
      "<p>Des missions ciblées sont menées sur les zones identifiées comme sensibles afin de lutter contre la fraude et la contrebande minière.</p><p>Ces actions contribuent à protéger les redevances de l'État et à sécuriser les chaînes d'approvisionnement légales.</p>",
  },
];

export const DEFAULT_NEWS_EN: DefaultNewsArticleSeed[] = [
  {
    slug: "igm-presence-strategic-mining-sites",
    title: "Strengthening IGM presence on strategic mining sites.",
    excerpt:
      "Deployment of teams and coordination with local authorities for more regular and better documented inspections.",
    category: "inspection",
    publishedAt: "2026-01-08T10:00:00.000Z",
    contentHtml:
      "<p>The General Inspectorate of Mines is increasing its presence on strategic mining sites to strengthen compliance and traceability of extractive activities.</p><p>Dedicated teams are deployed in coordination with provincial authorities for more regular, documented inspections shared with institutional partners.</p>",
  },
  {
    slug: "modernising-information-flows",
    title: "Modernising information flows for better traceability.",
    excerpt:
      "Towards dematerialised procedures and secure exchanges between IGM, CAMI and sector operators.",
    category: "digitalisation",
    publishedAt: "2025-12-22T10:00:00.000Z",
    contentHtml:
      "<p>Modernising information flows aims to make mining data more reliable and speed up exchanges between IGM, CAMI and operators.</p><p>Dematerialised procedures are being rolled out progressively to improve sector traceability and transparency.</p>",
  },
  {
    slug: "fraud-smuggling-missions",
    title: "Fraud smuggling missions.",
    excerpt:
      "Mapping risk areas and strengthening sanctions to protect state royalties and legal supply chains.",
    category: "conformite",
    publishedAt: "2025-11-05T10:00:00.000Z",
    contentHtml:
      "<p>Targeted missions are carried out in identified sensitive areas to combat mining fraud and smuggling.</p><p>These actions help protect state royalties and secure legal supply chains.</p>",
  },
];

export const DEFAULT_HOME_NEWS_SECTION_FR = {
  title: "Dernières actualités.",
  lead:
    "Points d'actualité sur l'inspection, le cadastre et la régulation du secteur minier.",
  maxItems: 4,
};

export const DEFAULT_HOME_NEWS_SECTION_EN = {
  title: "Latest news.",
  lead: "Updates on inspection, cadastre and mining sector regulation.",
  maxItems: 4,
};
