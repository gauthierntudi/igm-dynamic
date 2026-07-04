import type { SupportedLocale } from "@/i18n/locales";

import { getChatLanguageModel, hasChatLlmConfigured } from "./chatModel";
import { matchFaqAnswer, type ChatAnswer } from "./faqAnswers";
import { prepareChatContext } from "./prepareChatContext";

export type { ChatAnswer, ChatSource } from "./faqAnswers";

async function answerWithLlm(
  locale: SupportedLocale,
  question: string,
  systemPrompt: string,
): Promise<string | null> {
  const model = getChatLanguageModel();
  if (!model) return null;

  try {
    const { generateText } = await import("ai");
    const result = await generateText({
      model,
      system: systemPrompt,
      prompt: question,
      temperature: 0.55,
    });
    return result.text.trim() || null;
  } catch {
    return null;
  }
}

/** Réponse non-streamée (legacy / tests). Préférer /api/chat avec AI SDK. */
export async function answerChatQuestion(
  locale: SupportedLocale,
  question: string,
): Promise<ChatAnswer> {
  const prepared = await prepareChatContext(locale, question);

  if (prepared.directAnswer) {
    return { answer: prepared.directAnswer, sources: prepared.sources };
  }

  const llmAnswer = await answerWithLlm(locale, question.trim(), prepared.systemPrompt);
  if (llmAnswer) {
    return { answer: llmAnswer, sources: prepared.sources };
  }

  return { answer: prepared.fallbackAnswer, sources: prepared.sources };
}

export { matchFaqAnswer } from "./faqAnswers";
export { hasOpenAiKey, prepareChatContext } from "./prepareChatContext";
export { getChatLanguageModel, hasChatLlmConfigured, resolveChatLlmProvider } from "./chatModel";
