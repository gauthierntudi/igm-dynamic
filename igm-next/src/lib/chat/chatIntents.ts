import { hrefForRoute } from "@/i18n/paths";
import type { SupportedLocale } from "@/i18n/locales";

import type { ChatAnswer, ChatSource } from "./faqAnswers";
import type { KnowledgeChunk } from "./knowledgeBase";
import { normalizeForSearch } from "./textUtils";

const PHONE_QUESTION =
  /\b(numero vert|numero|green number|green line|telephone|tel\b|appeler|joindre|contacter|call|phone number|hotline)\b/;

const GREEN_NUMBER_QUESTION =
  /\b(numero vert|green number|green line|ligne verte|hotline)\b/;

const CARTOGRAPHY_COVERAGE_QUESTION =
  /\b(province|provinces|couverture|couvert|couverte|deploiement|deploye|territorial|cartographie|carte miniere|presence.{0,24}igm|igm.{0,24}province|combien.{0,20}province|toutes les provinces)\b/;

const LOCATION_QUESTION =
  /\b(bureau|adresse|situe|situee|localisation|localiser|ou se trouve|ou est|kinshasa|\bkin\b|gombe|siege|bureaux|office|address|located|where are you|where is the office|headquarters)\b/;

export function isLocationQuestion(question: string): boolean {
  return LOCATION_QUESTION.test(normalizeForSearch(question));
}

export function isContactQuestion(question: string): boolean {
  return isContactPhoneQuestion(question) || isLocationQuestion(question);
}

export function isContactPhoneQuestion(question: string): boolean {
  return PHONE_QUESTION.test(normalizeForSearch(question));
}

export function isGreenNumberQuestion(question: string): boolean {
  return GREEN_NUMBER_QUESTION.test(normalizeForSearch(question));
}

export function isCartographyCoverageQuestion(question: string): boolean {
  const normalized = normalizeForSearch(question);
  if (CARTOGRAPHY_COVERAGE_QUESTION.test(normalized)) return true;
  return /\b(22|25|26)\b/.test(normalized) && /\bprovince/.test(normalized);
}

export function extractPhoneFromChunk(chunk: KnowledgeChunk | undefined): string | null {
  if (!chunk) return null;

  const explicit = chunk.text.match(
    /(?:num[eé]ro vert|green line|green number|t[eé]l[eé]phone)\s*:\s*([+\d][+\d\s().-]{7,})/i,
  );
  if (explicit?.[1]) return explicit[1].trim();

  const generic = chunk.text.match(/(\+\d{2,3}[\d\s().-]{7,})/);
  return generic?.[1]?.trim() ?? null;
}

export function extractAddressFromChunk(chunk: KnowledgeChunk | undefined): string | null {
  if (!chunk) return null;

  const labeled = chunk.text.match(
    /Adresse(?: du si[eè]ge)?\s*:\s*(.+?)(?=\s+(?:E-mail|Email|T[eé]l[eé]phone|Num[eé]ro vert)\s*:)/i,
  );
  if (labeled?.[1]?.trim()) {
    return labeled[1].trim().replace(/\.$/, "");
  }

  const kinshasa = chunk.text.match(/(\d[\d\s,./A-Za-z-]*(?:Kinshasa|Gombe)[^.]*)/i);
  return kinshasa?.[1]?.trim() ?? null;
}

export function buildLocationAnswer(locale: SupportedLocale, address: string): ChatAnswer {
  const contactUrl = hrefForRoute("contact", locale);

  if (locale === "fr") {
    return {
      answer: `Oui. L'IGM est établie à Kinshasa : ${address}. Vous trouverez l'adresse complète et le plan sur la page Contact.`,
      sources: [{ title: "Contact IGM", url: contactUrl }],
    };
  }

  return {
    answer: `Yes. IGM is based in Kinshasa: ${address}. You will find the full address and map on the Contact page.`,
    sources: [{ title: "IGM contact", url: contactUrl }],
  };
}

export function findContactChunk(knowledge: KnowledgeChunk[]): KnowledgeChunk | undefined {
  return knowledge.find((chunk) => chunk.id === "contact");
}

export function buildGreenNumberAnswer(
  locale: SupportedLocale,
  phone: string,
): ChatAnswer {
  const contactUrl = hrefForRoute("contact", locale);

  if (locale === "fr") {
    return {
      answer: `Oui. L'IGM dispose d'un numéro vert : ${phone}. Vous le trouvez en haut de chaque page du site et sur la page Contact.`,
      sources: [{ title: "Contact IGM", url: contactUrl }],
    };
  }

  return {
    answer: `Yes. IGM has a green line: ${phone}. You can find it at the top of every page and on the Contact page.`,
    sources: [{ title: "IGM contact", url: contactUrl }],
  };
}

export function filterPublicSources(sources: ChatSource[]): ChatSource[] {
  return dedupeSources(sources).filter((source) => {
    const url = source.url.trim();
    if (!url.startsWith("/")) return false;
    if (url.includes("/api/")) return false;
    if (url.includes("?")) return false;
    return true;
  });
}

export function dedupeSources(sources: ChatSource[]): ChatSource[] {
  const seen = new Set<string>();
  const unique: ChatSource[] = [];

  for (const source of sources) {
    const key = source.url.trim();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    unique.push(source);
  }

  return unique;
}
