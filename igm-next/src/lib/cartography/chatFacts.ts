import { hrefForRoute } from "@/i18n/paths";
import type { SupportedLocale } from "@/i18n/locales";
import type { ChatAnswer } from "@/lib/chat/faqAnswers";

import {
  DEPLOYED_PROVINCES_COUNT,
  DRC_MAP_PROVINCES,
  UNDEPLOYED_MAP_PROVINCES,
  provinceLabel,
} from "./provinces";

export const TOTAL_DRC_PROVINCES = DRC_MAP_PROVINCES.length;

export function formatUndeployedProvinceList(locale: SupportedLocale): string {
  return UNDEPLOYED_MAP_PROVINCES.map((name) => provinceLabel(name, locale)).join(", ");
}

/** Texte injecté dans la base de connaissances chat (source : cartographie du site). */
export function buildCartographyKnowledgeText(locale: SupportedLocale): string {
  const undeployed = formatUndeployedProvinceList(locale);

  if (locale === "fr") {
    return [
      "La cartographie interactive présente le déploiement territorial de l'IGM en République Démocratique du Congo.",
      `La RDC compte ${TOTAL_DRC_PROVINCES} provinces (découpage provincial 2015).`,
      `L'IGM est déployée dans ${DEPLOYED_PROVINCES_COUNT} provinces couvertes sur ${TOTAL_DRC_PROVINCES}.`,
      `Provinces sans déploiement IGM actif sur la carte : ${undeployed}.`,
    ].join(" ");
  }

  return [
    "The interactive map shows IGM territorial deployment in the Democratic Republic of Congo.",
    `The DRC has ${TOTAL_DRC_PROVINCES} provinces (2015 provincial breakdown).`,
    `IGM is deployed in ${DEPLOYED_PROVINCES_COUNT} covered provinces out of ${TOTAL_DRC_PROVINCES}.`,
    `Provinces without active IGM deployment on the map: ${undeployed}.`,
  ].join(" ");
}

/** Réponse déterministe alignée sur la cartographie du site (sans LLM). */
export function buildCartographyCoverageAnswer(locale: SupportedLocale): ChatAnswer {
  const mapUrl = hrefForRoute("map", locale);
  const undeployed = formatUndeployedProvinceList(locale);

  if (locale === "fr") {
    return {
      answer: `D'après la cartographie publiée sur ce site, la RDC compte ${TOTAL_DRC_PROVINCES} provinces. L'IGM y est déployée dans ${DEPLOYED_PROVINCES_COUNT} provinces (${DEPLOYED_PROVINCES_COUNT} couvertes sur ${TOTAL_DRC_PROVINCES}). Les provinces affichées sans déploiement actif sont : ${undeployed}. Pour le détail par province, consultez la cartographie interactive.`,
      sources: [{ title: "Cartographie", url: mapUrl }],
    };
  }

  return {
    answer: `According to the map published on this site, the DRC has ${TOTAL_DRC_PROVINCES} provinces. IGM is deployed in ${DEPLOYED_PROVINCES_COUNT} provinces (${DEPLOYED_PROVINCES_COUNT} covered out of ${TOTAL_DRC_PROVINCES}). Provinces shown without active deployment: ${undeployed}. See the interactive map for province-level detail.`,
    sources: [{ title: "Mining map", url: mapUrl }],
  };
}
