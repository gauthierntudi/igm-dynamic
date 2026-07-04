import type { SupportedLocale } from "@/i18n/locales";

import { normalizeForSearch } from "./textUtils";

/** Sujets couverts par l'assistant (site IGM). */
const IGM_TOPIC =
  /\b(igm|inspection.{0,20}mines|mine|minier|miniere|mining|signalement|signaler|denoncer|contrebande|cartographie|conformite|exploitation miniere|secteur minier|numero vert|green line|transparence miniere|inspection generale)\b/;

const OFF_TOPIC_PERSONAL =
  /\b(drague|dragger|draguer|seduir|seduction|pickup|flirt|flirter|copine|petite amie|petit ami|petite-amie|rencontre amoureuse|relation amoureuse|conquete|filles? de \d+|gars de \d+|homme de \d+|femme de \d+|dating|girlfriend|boyfriend|pick up|crush|romance|sortir avec|date her|date him)\b/;

const OFF_TOPIC_GENERAL =
  /\b(reussir dans la vie|reussite dans la vie|bonheur|conseils? de vie|life advice|how to succeed in life|how to be happy|epanouissement|developpement personnel|dev perso|coaching de vie|motivation personnelle|trouver l amour|maigrir|perdre du poids|recette de|cuisiner un|film a voir|serie netflix|parier sur|gagner au loto|astrologie|horoscope)\b/;

const OFF_TOPIC_SENSITIVE =
  /\b(porno|sexe|strip tease|faire l amour|casino|paris sportif|pirater|torrent|hack compte|malware|fabriquer.{0,12}(bombe|arme)|drogue recreative)\b/;

const OFF_TOPIC_INSISTENCE =
  /\b(tu peux quand meme|quand meme repondre|reponds quand meme|answer anyway|just answer|tu peux toujours|you can still|mais reponds|fais le quand meme|repond quand meme|vas y reponds|allez reponds|reponds moi quand meme)\b/;

export function isIgmRelatedQuestion(question: string): boolean {
  return IGM_TOPIC.test(normalizeForSearch(question));
}

export function isOffTopicQuestion(question: string): boolean {
  if (isIgmRelatedQuestion(question)) return false;

  const normalized = normalizeForSearch(question);
  return (
    OFF_TOPIC_PERSONAL.test(normalized) ||
    OFF_TOPIC_GENERAL.test(normalized) ||
    OFF_TOPIC_SENSITIVE.test(normalized)
  );
}

/** Score RAG minimum pour autoriser le LLM sans mot-clé IGM explicite. */
export const MIN_LLM_RANK_SCORE = 10;

/** Question couverte par l'assistant (IGM ou correspondance forte au contenu du site). */
export function isInAssistantScope(question: string, topRankScore = 0): boolean {
  if (isIgmRelatedQuestion(question)) return true;
  return topRankScore >= MIN_LLM_RANK_SCORE;
}

export function isOffTopicInsistence(question: string): boolean {
  return OFF_TOPIC_INSISTENCE.test(normalizeForSearch(question));
}

export function buildOffTopicRefusal(locale: SupportedLocale, repeated = false): string {
  if (locale === "fr") {
    if (repeated) {
      return "Je ne peux pas répondre à ce type de demande, même si vous insistez. Je suis l'assistant du site IGM et je traite uniquement les sujets liés à l'Inspection Générale des Mines : missions, cartographie, signalement et contact. Posez-moi une question sur l'IGM.";
    }

    return "Cette question ne relève pas de l'assistant IGM. Je peux vous renseigner sur les missions de l'Inspection Générale des Mines, la cartographie minière, les signalements ou nos coordonnées. Que souhaitez-vous savoir sur l'IGM ?";
  }

  if (repeated) {
    return "I cannot answer that kind of request, even if you insist. I am the IGM website assistant and I only handle topics related to the General Inspectorate of Mines: missions, map, reporting and contact. Please ask me something about IGM.";
  }

  return "That question is outside the scope of the IGM assistant. I can help with the General Inspectorate of Mines' missions, the mining map, reporting or our contact details. What would you like to know about IGM?";
}

export type OffTopicGuardResult =
  | { blocked: true; answer: string }
  | { blocked: false };

export function evaluateOffTopicGuard(
  locale: SupportedLocale,
  question: string,
  priorUserQuestions: string[] = [],
): OffTopicGuardResult {
  if (isOffTopicQuestion(question)) {
    return { blocked: true, answer: buildOffTopicRefusal(locale, false) };
  }

  if (isOffTopicInsistence(question)) {
    const followedOffTopic = priorUserQuestions.some(isOffTopicQuestion);
    if (followedOffTopic || !isIgmRelatedQuestion(question)) {
      return { blocked: true, answer: buildOffTopicRefusal(locale, true) };
    }
  }

  return { blocked: false };
}
