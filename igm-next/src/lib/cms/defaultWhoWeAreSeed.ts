import type { CmsWhoWeAre } from "./who-we-are/types";

/** Contenu statique de la page À propos (utilisé tant que WHO_WE_ARE_USE_CMS est false). */
export const DEFAULT_WHO_WE_ARE_FR: CmsWhoWeAre = {
  seoTitle: "Qui sommes-nous ? — IGM",
  seoDescription:
    "Découvrez l'Inspection Générale des Mines : son rôle, son histoire et sa mission au service de la gouvernance minière en RDC.",
  headline: "Une inspection rigoureuse pour un secteur minier transparent et durable",
  intro: "",
  navAboutLabel: "Qui sommes-nous ?",
  navHistoryLabel: "Historique",
  navMissionLabel: "Mission",
  aboutSection: {
    title: "À propos de l'IGM",
    body: [
      "Le secteur minier constitue l'un des piliers de l'économie de la République Démocratique du Congo. Soucieux de renforcer la gouvernance de ce secteur, le Président de la République, Félix-Antoine Tshisekedi Tshilombo a impulsé la création d'un organe dédié au contrôle et à l'inspection des activités minières.",
      "Cette vision s'est concrétisée par l'émission du Décret n°23/19 du 09 juin 2023 portant création, organisation et fonctionnement de l'Inspection Générale des Mines (IGM).",
      "L'IGM a pour vocation de veiller à l'application rigoureuse de la législation minière, promouvoir les bonnes pratiques et contribuer à une gestion plus transparente, plus responsable et plus sécurisée des ressources minérales de la République Démocratique du Congo.",
    ].join("\n"),
    quote: {
      text: "",
      authorName: "",
      authorRole: "",
    },
  },
  historySection: {
    title: "Historique de l'Inspection Générale des Mines (IGM)",
    headline: "Un acteur central de la gouvernance minière",
    lead:
      "Ces réformes ont mis en évidence la nécessité d'un organe indépendant, doté de pouvoirs renforcés, capable d'assurer la transparence, la conformité, la traçabilité et la bonne gouvernance dans un secteur stratégique pour l'économie nationale.",
    body: [
      "L'Inspection Générale des Mines (IGM) est un service public spécialisé de l'État congolais, créé par le Décret n°23/19 du 09 juin 2023. ([Consultez le décret ici](/decrets)) Elle est dotée d'autonomie administrative et financière et placée sous l'autorité du Ministre ayant les Mines dans ses attributions, conformément à l'article 1er dudit Décret.",
      "La création de l'IGM s'inscrit dans la dynamique des grandes réformes du secteur minier initiées par le Gouvernement de la République Démocratique du Congo, notamment celles découlant du Code minier ([Consultez le Code minier ici](/lois)) (Loi n°007/2002 modifiée par la Loi n°18/001 du 09 mars 2018) et du ([Consultez le Règlement minier ici](/decrets)) (Décret n°038/2003 modifié par le Décret Règlement minier n°18/024 du 08 juin 2018).",
      "Ces réformes ont mis en évidence la nécessité d'un organe indépendant, doté de pouvoirs renforcés, capable d'assurer la transparence, la conformité, la traçabilité et la bonne gouvernance dans un secteur stratégique pour l'économie nationale.",
      "L'IGM a été créée pour répondre à plusieurs défis majeurs identifiés par le Gouvernement, notamment :",
      "• La recrudescence de la fraude et de la contrebande minières ;",
      "• La nécessité de renforcer la sécurisation des substances minérales ;",
      "• L'exigence d'une meilleure coordination entre les services publics intervenant dans la chaîne minière ;",
      "• La volonté d'assurer un contrôle supérieur sur les opérations minières, conformément aux exigences du Code minier.",
      "Au fil du temps, l'IGM a vu ses missions s'élargir, conformément aux articles 5 et 4 du Décret n°23/19, pour couvrir :",
      "• Le contrôle technique et opérationnel des activités minières ;",
      "• La lutte contre la fraude et la contrebande minières, y compris la transmission illicite d'informations et la sous-évaluation des apports de l'État ;",
      "• La sécurisation des substances minérales du site d'exploitation jusqu'au point d'exportation ;",
      "• La supervision des obligations sociales et environnementales des opérateurs miniers ;",
      "• La coordination interservices avec la DGDA, la PNC, la CENAREF, Interpol, le CEEC et d'autres institutions spécialisées.",
      "Aujourd'hui, l'Inspection Générale des Mines s'impose comme un acteur central de la gouvernance minière, travaillant en étroite collaboration avec les institutions nationales, les provinces, les services spécialisés et les partenaires.",
    ].join("\n"),
  },
  missionSection: {
    title: "Mission",
    lead: "La mission de l'Inspection Générale des Mines est double :",
    headline: "Surveiller et protéger.",
    body: [
      "Elle veille à l'intégrité de la chaîne de valeur minière par le contrôle, l'inspection et le suivi des activités minières. Elle lutte également contre la fraude, la contrebande et toutes les formes d'exploitation illicite des ressources minérales.",
    ].join("\n"),
    statutoryTitle: "Missions statutaires",
    statutoryItems: [
      { label: "Lutter contre la fraude et la contrebande minières sous toutes leurs formes." },
      {
        label:
          "Concevoir, mettre en œuvre et assurer le suivi de mesures de collaboration entre les services publics habilités.",
      },
      {
        label:
          "Prévenir, rechercher et constater les infractions à la législation et à la réglementation minières.",
      },
      { label: "Lutter contre la fraude intra et transfrontalière ainsi que la contrebande minières." },
      {
        label:
          "Concevoir des stratégies et des plans opérationnels de lutte contre la fraude et la contrebande.",
      },
    ],
    prioritiesTitle: "Priorités actuelles",
    priorities: [
      { label: "Lutter contre la fraude et la contrebande minière." },
      { label: "Assainir la chaîne de production minière." },
      { label: "Garantir le respect des normes sociales et environnementales." },
      { label: "Déployer les inspecteurs dans les 22 provinces." },
      { label: "Moderniser le cadastre et digitaliser les flux de production." },
    ],
  },
  statsSection: {
    items: [
      { label: "Provinces couvertes", value: "22" },
      { label: "Années d'engagement renforcé", value: "2026+" },
      { label: "Missions statutaires", value: "6+" },
    ],
  },
  teamSection: {
    title: "Notre équipe de direction",
    lead: "Des professionnels engagés pour une gouvernance minière exemplaire en RDC.",
    members: [
      { name: "Rafaël Kabengele", role: "Inspecteur Général de l'IGM" },
    ],
  },
  ctaSection: {
    title: "Rejoignez notre mission",
    text: "Contribuez à la transparence et à la rigueur du secteur minier congolais.",
    link: { label: "Nous contacter", navLink: "/contact" },
  },
  contactSection: {
    title: "Une question ? Notre équipe est à votre écoute",
    lead: "Contactez l'Inspection Générale des Mines pour toute information ou demande d'assistance.",
    primaryCta: { label: "Nous contacter", navLink: "/contact" },
    phoneLabel: "+243 976 844 563",
    phoneHref: "tel:+243976844563",
  },
};

export const DEFAULT_WHO_WE_ARE_EN: CmsWhoWeAre = {
  seoTitle: "Who we are — IGM",
  seoDescription:
    "Learn about the General Inspectorate of Mines: its role, history and mission in support of mining governance in the DRC.",
  headline: "Rigorous inspection for a transparent and sustainable mining sector",
  intro: "",
  navAboutLabel: "Who we are",
  navHistoryLabel: "History",
  navMissionLabel: "Mission",
  aboutSection: {
    title: "About the IGM",
    body: [
      "The mining sector is one of the Democratic Republic of the Congo's pillars of the economy. Recognizing the need to strengthen governance in this strategic sector, the President of the Republic, Félix-Antoine Tshisekedi Tshilombo, spearheaded the establishment of a dedicated body responsible for the oversight and inspection of mining activities.",
      "This vision materialized through the enactment of Decree No. 23/19 of 9 June 2023 establishing, organizing and governing the General Inspectorate of Mines (GIM).",
      "The GIM is mandated to ensure strict compliance with mining legislation, promote best practices, and contribute to a more transparent, accountable, and secure management of the Democratic Republic of the Congo's mineral resources.",
    ].join("\n"),
    quote: {
      text: "",
      authorName: "",
      authorRole: "",
    },
  },
  historySection: {
    title: "History of the General Inspectorate of Mines (IGM)",
    headline: "A central actor in mining governance",
    lead:
      "These reforms highlighted the need for an independent body with strengthened powers, capable of ensuring transparency, compliance, traceability and good governance in a sector that is strategic for the national economy.",
    body: [
      "The General Inspectorate of Mines (IGM) is a specialised public service of the Congolese State, created by Decree No. 23/19 of 9 June 2023. ([Consult the decree here](/decrets)) It has administrative and financial autonomy and is placed under the authority of the Minister responsible for Mines, in accordance with Article 1 of the said Decree.",
      "The creation of the IGM is part of the major reforms of the mining sector initiated by the Government of the Democratic Republic of Congo, in particular those arising from the Mining Code ([Consult the Mining Code here](/lois)) (Law No. 007/2002 as amended by Law No. 18/001 of 9 March 2018) and the ([Consult the Mining Regulations here](/decrets)) (Decree No. 038/2003 as amended by Mining Regulations Decree No. 18/024 of 8 June 2018).",
      "These reforms highlighted the need for an independent body with strengthened powers, capable of ensuring transparency, compliance, traceability and good governance in a sector that is strategic for the national economy.",
      "The IGM was created to address several major challenges identified by the Government, including:",
      "• The increase in mining fraud and smuggling;",
      "• The need to strengthen the security of mineral substances;",
      "• The requirement for better coordination between public services involved in the mining chain;",
      "• The desire to ensure superior control over mining operations, in accordance with the requirements of the Mining Code.",
      "Over time, the IGM has seen its missions expand, in accordance with Articles 5 and 4 of Decree No. 23/19, to cover:",
      "• Technical and operational control of mining activities;",
      "• The fight against mining fraud and smuggling, including illicit transmission of information and undervaluation of State contributions;",
      "• Securing mineral substances from the exploitation site to the point of export;",
      "• Supervision of social and environmental obligations of mining operators;",
      "• Inter-agency coordination with DGDA, PNC, CENAREF, Interpol, CEEC and other specialised institutions.",
      "Today, the General Inspectorate of Mines stands as a central actor in mining governance, working closely with national institutions, provinces, specialised services and partners.",
    ].join("\n"),
  },
  missionSection: {
    title: "Mission",
    lead:
      "The IGM carries out control, prevention and coordination missions to improve the national mining production chain.",
    headline: "Together, we strengthen mining governance",
    body: [
      "Our work aims to maximise State revenue while ensuring responsible exploitation for the benefit of the nation.",
      "We implement monitoring and control mechanisms to ensure traceability of natural resources and promote sustainable management of the mining sector.",
    ].join("\n"),
    statutoryTitle: "Statutory missions",
    statutoryItems: [
      { label: "Combat mining fraud and smuggling in all their forms." },
      {
        label:
          "Design, implement and monitor practical collaboration measures between authorised public services.",
      },
      {
        label:
          "Prevent, investigate and record breaches of mining legislation and regulations.",
      },
      { label: "Combat domestic and cross-border fraud and mining smuggling." },
      {
        label:
          "Design strategies and operational plans to fight fraud and smuggling.",
      },
    ],
    prioritiesTitle: "Current priorities",
    priorities: [
      { label: "Combat mining fraud and smuggling." },
      { label: "Improve the mining production chain." },
      { label: "Ensure compliance with social and environmental standards." },
      { label: "Deploy inspectors across 22 provinces." },
      { label: "Modernise the cadastre and digitise production flows." },
    ],
  },
  statsSection: {
    items: [
      { label: "Provinces covered", value: "22" },
      { label: "Years of strengthened commitment", value: "2026+" },
      { label: "Statutory missions", value: "6+" },
    ],
  },
  teamSection: {
    title: "Our leadership team",
    lead: "Professionals committed to exemplary mining governance in the DRC.",
    members: [{ name: "Rafaël Kabengele", role: "Inspector General of the IGM" }],
  },
  ctaSection: {
    title: "Join our mission",
    text: "Help strengthen transparency and rigour in the Congolese mining sector.",
    link: { label: "Contact us", navLink: "/contact" },
  },
  contactSection: {
    title: "Have a question? Our team is here to help",
    lead: "Contact the General Inspectorate of Mines for information or assistance.",
    primaryCta: { label: "Contact us", navLink: "/contact" },
    phoneLabel: "+243 976 844 563",
    phoneHref: "tel:+243976844563",
  },
};
