import { hrefForRoute } from "@/i18n/paths";
import type { SupportedLocale } from "@/i18n/locales";

import { normalizeForSearch } from "./textUtils";

export type ChatSource = {
  title: string;
  url: string;
};

export type ChatAnswer = {
  answer: string;
  sources: ChatSource[];
};

export type FaqSuggestion = {
  id: string;
  label: string;
};

type FaqEntry = {
  id: string;
  patterns: string[];
  build: (locale: SupportedLocale) => ChatAnswer;
};

function missionUrl(locale: SupportedLocale): string {
  return `${hrefForRoute("about", locale)}#igm-wwa-mission`;
}

const FAQ_ENTRIES: FaqEntry[] = [
  {
    id: "mission",
    patterns: [
      "quelle est la mission de l igm",
      "mission de l igm",
      "mission igm",
      "what is igm s mission",
      "igm mission",
      "what is the mission of igm",
    ],
    build: (locale) =>
      locale === "fr"
        ? {
            answer:
              "L'IGM veille au respect de la législation minière et à la transparence du secteur en RDC. Découvrez nos missions statutaires et nos priorités sur la page Qui sommes-nous.",
            sources: [{ title: "Notre mission", url: missionUrl(locale) }],
          }
        : {
            answer:
              "IGM oversees compliance with mining legislation and transparency in the DRC mining sector. Discover our statutory missions and priorities on the About page.",
            sources: [{ title: "Our mission", url: missionUrl(locale) }],
          },
  },
  {
    id: "report",
    patterns: [
      "comment signaler un cas",
      "comment signaler",
      "signaler un cas",
      "denoncer",
      "how do i report a case",
      "how to report",
      "report a case",
    ],
    build: (locale) =>
      locale === "fr"
        ? {
            answer:
              "Vous pouvez transmettre un signalement via le formulaire Dénoncer, de manière anonyme si vous le souhaitez. Joignez des photos, audios ou documents utiles.",
            sources: [{ title: "Dénoncer", url: hrefForRoute("report", locale) }],
          }
        : {
            answer:
              "You can submit a report via the Report form, anonymously if you wish. Attach photos, audio or documents when helpful.",
            sources: [{ title: "Report", url: hrefForRoute("report", locale) }],
          },
  },
  {
    id: "map",
    patterns: [
      "ou consulter la cartographie",
      "cartographie",
      "carte miniere",
      "where is the map",
      "mining map",
      "mapping",
    ],
    build: (locale) =>
      locale === "fr"
        ? {
            answer:
              "La cartographie interactive présente les activités minières par province et par site en République Démocratique du Congo.",
            sources: [{ title: "Cartographie", url: hrefForRoute("map", locale) }],
          }
        : {
            answer:
              "The interactive map shows mining activities by province and site across the Democratic Republic of Congo.",
            sources: [{ title: "Mining map", url: hrefForRoute("map", locale) }],
          },
  },
];

export function getFaqSuggestions(locale: SupportedLocale): FaqSuggestion[] {
  if (locale === "fr") {
    return [
      { id: "mission", label: "Quelle est la mission de l'IGM ?" },
      { id: "report", label: "Comment signaler un cas ?" },
      { id: "map", label: "Où consulter la cartographie ?" },
    ];
  }

  return [
    { id: "mission", label: "What is IGM's mission?" },
    { id: "report", label: "How do I report a case?" },
    { id: "map", label: "Where is the map?" },
  ];
}

export function getFaqAnswerById(
  locale: SupportedLocale,
  id: string,
): ChatAnswer | null {
  const entry = FAQ_ENTRIES.find((item) => item.id === id);
  return entry ? entry.build(locale) : null;
}

export function matchFaqAnswer(
  locale: SupportedLocale,
  question: string,
): ChatAnswer | null {
  const normalized = normalizeForSearch(question);
  if (!normalized) return null;

  for (const entry of FAQ_ENTRIES) {
    const matched = entry.patterns.some(
      (pattern) => normalized === pattern || normalized.includes(pattern),
    );
    if (matched) return entry.build(locale);
  }

  return null;
}
