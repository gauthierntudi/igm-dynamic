import type { SupportedLocale } from "@/i18n/locales";

import {
  buildGreenNumberAnswer,
  buildLocationAnswer,
  dedupeSources,
  extractAddressFromChunk,
  extractPhoneFromChunk,
  filterPublicSources,
  findContactChunk,
  isCartographyCoverageQuestion,
  isContactPhoneQuestion,
  isContactQuestion,
  isGreenNumberQuestion,
  isLocationQuestion,
} from "./chatIntents";
import { getChatLanguageModel, hasChatLlmConfigured } from "./chatModel";
import { matchFaqAnswer, type ChatSource } from "./faqAnswers";
import { getKnowledgeBase, type KnowledgeChunk } from "./knowledgeBase";
import { buildIgmChatSystemPrompt } from "./systemPrompt";
import { normalizeForSearch, tokenizeForSearch, tokenizeQuery } from "./textUtils";
import { buildCartographyCoverageAnswer } from "@/lib/cartography/chatFacts";
import { buildOffTopicRefusal, evaluateOffTopicGuard, isInAssistantScope } from "./chatGuardrails";

export type PreparedChatContext = {
  /** Réponse immédiate (FAQ, small talk) — pas d'appel LLM. */
  directAnswer?: string;
  /** Contexte RAG injecté dans le prompt système. */
  systemPrompt: string;
  /** Sources à afficher sous la réponse. */
  sources: ChatSource[];
  /** Réponse de secours sans clé OpenAI. */
  fallbackAnswer: string;
};

const MIN_RANK_SCORE = 3;
const GENERIC_TOKENS = new Set(["igm", "rdc", "mines", "minier", "mine", "mining", "congo"]);

type RankedChunk = {
  item: KnowledgeChunk;
  score: number;
};

function scoreChunk(
  chunk: KnowledgeChunk,
  question: string,
  tokens: string[],
  contactIntent: boolean,
): number {
  const haystack = normalizeForSearch(`${chunk.title} ${chunk.text}`);
  const normalizedQuery = normalizeForSearch(question);
  let score = 0;

  if (chunk.id === "contact" && contactIntent) {
    score += 24;
  }

  if (isLocationQuestion(question) && chunk.id === "contact") {
    score += 28;
  }

  if (isGreenNumberQuestion(question) && chunk.id === "contact") {
    score += 30;
  }

  if (
    isCartographyCoverageQuestion(question) &&
    (chunk.id === "cartographie" || chunk.id === "cartographie-cms")
  ) {
    score += 32;
  }

  if (normalizedQuery && haystack.includes(normalizedQuery)) {
    score += 14;
  }

  for (const phrase of ["numero vert", "green line", "green number", "numero vert igm"]) {
    if (normalizedQuery.includes(phrase) && haystack.includes(phrase)) {
      score += 18;
    }
  }

  for (const token of tokens) {
    if (!haystack.includes(token)) continue;

    if (GENERIC_TOKENS.has(token)) {
      score += 0.5;
      continue;
    }

    score += 3;
    if (normalizeForSearch(chunk.title).includes(token)) {
      score += 4;
    }
  }

  if (chunk.id.startsWith("news-")) {
    score *= 0.35;
  }

  if (["contact", "signalement", "cartographie", "who-we-are", "home"].includes(chunk.id)) {
    score += 1.5;
  }

  return score;
}

function rankChunks(
  knowledge: KnowledgeChunk[],
  question: string,
  contactIntent: boolean,
): RankedChunk[] {
  const tokens = tokenizeQuery(question);
  const fallbackTokens = tokenizeForSearch(question).filter((token) => !GENERIC_TOKENS.has(token));

  return knowledge
    .map((item) => ({
      item,
      score: Math.max(
        scoreChunk(item, question, tokens, contactIntent),
        scoreChunk(item, question, fallbackTokens, contactIntent),
      ),
    }))
    .filter((entry) => entry.score >= MIN_RANK_SCORE)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);
}

function fallbackChunks(knowledge: KnowledgeChunk[]): KnowledgeChunk[] {
  const preferredIds = new Set([
    "home",
    "who-we-are",
    "contact",
    "signalement",
    "cartographie",
  ]);

  const preferred = knowledge.filter((item) => preferredIds.has(item.id));
  if (preferred.length >= 3) return preferred.slice(0, 4);
  return knowledge.slice(0, 4);
}

export function hasOpenAiKey(): boolean {
  return hasChatLlmConfigured();
}

function smallTalkReply(locale: SupportedLocale, question: string): string | null {
  const normalized = normalizeForSearch(question);

  if (/^(bonjour|salut|bonsoir|coucou|hello|hi|hey)\b/.test(normalized)) {
    return locale === "fr"
      ? "Bonjour ! Je suis l'assistant IGM. Je peux vous renseigner sur nos missions, la cartographie minière, les actualités ou la procédure de signalement. Que souhaitez-vous savoir ?"
      : "Hello! I'm the IGM assistant. I can help with our missions, the mining map, news or the reporting process. What would you like to know?";
  }

  if (/^(merci|thanks|thank you|ok merci)\b/.test(normalized)) {
    return locale === "fr"
      ? "Avec plaisir ! N'hésitez pas si vous avez d'autres questions sur l'IGM."
      : "You're welcome! Feel free to ask if you have more questions about IGM.";
  }

  if (/^(au revoir|bye|goodbye|a bientot)\b/.test(normalized)) {
    return locale === "fr"
      ? "Au revoir ! Bonne navigation sur le site IGM."
      : "Goodbye! Enjoy browsing the IGM website.";
  }

  return null;
}

function buildNoMatchAnswer(locale: SupportedLocale): string {
  return locale === "fr"
    ? "Je n'ai pas trouvé d'information précise à ce sujet sur le site. Consultez la page Contact ou reformulez votre question — je peux vous orienter sur nos missions, la cartographie ou le signalement."
    : "I couldn't find specific information on that topic. See the Contact page or rephrase your question — I can help with our missions, the map or reporting.";
}

function buildFallbackAnswer(locale: SupportedLocale): string {
  return buildNoMatchAnswer(locale);
}

export function resolveContactLocationAnswer(
  locale: SupportedLocale,
  question: string,
  knowledge: KnowledgeChunk[],
): { directAnswer: string; sources: ChatSource[] } | null {
  if (!isLocationQuestion(question)) return null;

  const contactChunk = findContactChunk(knowledge);
  const address = extractAddressFromChunk(contactChunk);
  if (!address) return null;

  const answer = buildLocationAnswer(locale, address);
  return { directAnswer: answer.answer, sources: answer.sources };
}

export function resolveContactPhoneAnswer(
  locale: SupportedLocale,
  question: string,
  knowledge: KnowledgeChunk[],
): { directAnswer: string; sources: ChatSource[] } | null {
  if (!isContactPhoneQuestion(question)) return null;

  const contactChunk = findContactChunk(knowledge);
  const phone = extractPhoneFromChunk(contactChunk);
  if (!phone) return null;

  const answer = buildGreenNumberAnswer(locale, phone);
  return { directAnswer: answer.answer, sources: answer.sources };
}

export async function prepareChatContext(
  locale: SupportedLocale,
  question: string,
  options?: { priorUserQuestions?: string[] },
): Promise<PreparedChatContext> {
  const trimmed = question.trim();

  if (!trimmed) {
    return {
      directAnswer:
        locale === "fr"
          ? "Posez-moi une question sur l'IGM — missions, cartographie, actualités ou signalement."
          : "Ask me about IGM — missions, map, news or reporting.",
      systemPrompt: buildIgmChatSystemPrompt(locale, []),
      sources: [],
      fallbackAnswer: "",
    };
  }

  const offTopicGuard = evaluateOffTopicGuard(
    locale,
    trimmed,
    options?.priorUserQuestions ?? [],
  );
  if (offTopicGuard.blocked) {
    return {
      directAnswer: offTopicGuard.answer,
      systemPrompt: buildIgmChatSystemPrompt(locale, []),
      sources: [],
      fallbackAnswer: offTopicGuard.answer,
    };
  }

  const knowledge = await getKnowledgeBase(locale);
  const locationAnswer = resolveContactLocationAnswer(locale, trimmed, knowledge);
  if (locationAnswer) {
    const contactChunk = findContactChunk(knowledge);
    return {
      directAnswer: locationAnswer.directAnswer,
      systemPrompt: buildIgmChatSystemPrompt(locale, contactChunk ? [contactChunk] : []),
      sources: filterPublicSources(locationAnswer.sources),
      fallbackAnswer: locationAnswer.directAnswer,
    };
  }

  const contactAnswer = resolveContactPhoneAnswer(locale, trimmed, knowledge);
  if (contactAnswer) {
    const contactChunk = findContactChunk(knowledge);
    return {
      directAnswer: contactAnswer.directAnswer,
      systemPrompt: buildIgmChatSystemPrompt(locale, contactChunk ? [contactChunk] : []),
      sources: filterPublicSources(contactAnswer.sources),
      fallbackAnswer: contactAnswer.directAnswer,
    };
  }

  const faqAnswer = matchFaqAnswer(locale, trimmed);
  if (faqAnswer) {
    return {
      directAnswer: faqAnswer.answer,
      systemPrompt: buildIgmChatSystemPrompt(locale, []),
      sources: dedupeSources(faqAnswer.sources),
      fallbackAnswer: faqAnswer.answer,
    };
  }

  if (isCartographyCoverageQuestion(trimmed)) {
    const coverageAnswer = buildCartographyCoverageAnswer(locale);
    const cartographyChunk = knowledge.find(
      (item) => item.id === "cartographie" || item.id === "cartographie-cms",
    );

    return {
      directAnswer: coverageAnswer.answer,
      systemPrompt: buildIgmChatSystemPrompt(
        locale,
        cartographyChunk ? [cartographyChunk] : [],
      ),
      sources: filterPublicSources(coverageAnswer.sources),
      fallbackAnswer: coverageAnswer.answer,
    };
  }

  const smallTalk = smallTalkReply(locale, trimmed);
  if (smallTalk) {
    return {
      directAnswer: smallTalk,
      systemPrompt: buildIgmChatSystemPrompt(locale, []),
      sources: [],
      fallbackAnswer: smallTalk,
    };
  }

  const contactIntent = isContactQuestion(trimmed);
  const ranked = rankChunks(knowledge, trimmed, contactIntent);
  const topRankScore = ranked[0]?.score ?? 0;

  if (!isInAssistantScope(trimmed, topRankScore)) {
    const refusal = buildOffTopicRefusal(locale, false);
    return {
      directAnswer: refusal,
      systemPrompt: buildIgmChatSystemPrompt(locale, []),
      sources: [],
      fallbackAnswer: refusal,
    };
  }

  const contextChunks = ranked.length > 0 ? ranked.map((entry) => entry.item) : fallbackChunks(knowledge);
  const sources = filterPublicSources(
    ranked.slice(0, 2).map((entry) => ({ title: entry.item.title, url: entry.item.url })),
  );

  return {
    systemPrompt: buildIgmChatSystemPrompt(locale, contextChunks),
    sources,
    fallbackAnswer: buildFallbackAnswer(locale),
  };
}
