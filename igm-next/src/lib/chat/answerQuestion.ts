import type { SupportedLocale } from "@/i18n/locales";

import { matchFaqAnswer, type ChatAnswer } from "./faqAnswers";
import { getKnowledgeBase, type KnowledgeChunk } from "./knowledgeBase";
import { normalizeForSearch, tokenizeForSearch } from "./textUtils";

export type { ChatAnswer, ChatSource } from "./faqAnswers";

function scoreChunk(chunk: KnowledgeChunk, query: string, tokens: string[]): number {
  const haystack = normalizeForSearch(`${chunk.title} ${chunk.text}`);
  const normalizedQuery = normalizeForSearch(query);
  let score = 0;

  if (normalizedQuery && haystack.includes(normalizedQuery)) {
    score += 12;
  }

  for (const token of tokens) {
    if (haystack.includes(token)) score += 2;
    if (normalizeForSearch(chunk.title).includes(token)) score += 3;
  }

  return score;
}

function excerptAroundMatch(text: string, query: string, maxLength = 420): string {
  const normalizedText = normalizeForSearch(text);
  const normalizedQuery = normalizeForSearch(query);
  const index = normalizedQuery ? normalizedText.indexOf(normalizedQuery) : -1;

  if (index >= 0) {
    const start = Math.max(0, index - 80);
    const end = Math.min(text.length, start + maxLength);
    const slice = text.slice(start, end).trim();
    return `${start > 0 ? "…" : ""}${slice}${end < text.length ? "…" : ""}`;
  }

  return text.length > maxLength ? `${text.slice(0, maxLength).trim()}…` : text;
}

function rankChunks(knowledge: KnowledgeChunk[], question: string): KnowledgeChunk[] {
  const tokens = tokenizeForSearch(question);

  return knowledge
    .map((item) => ({ item, score: scoreChunk(item, question, tokens) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
    .map((entry) => entry.item);
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

function hasOpenAiKey(): boolean {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
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

async function answerWithLlm(
  locale: SupportedLocale,
  question: string,
  chunks: KnowledgeChunk[],
): Promise<string | null> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) return null;

  const context = chunks
    .slice(0, 8)
    .map((item, index) => `[${index + 1}] ${item.title}\n${item.text}`)
    .join("\n\n");

  const systemPrompt =
    locale === "fr"
      ? `Tu es l'assistant du site de l'Inspection Générale des Mines (IGM) en RDC.

Style :
- Parle comme un conseiller humain : naturel, chaleureux, direct.
- Chaque message doit se lire comme une vraie réponse de chat, pas comme un extrait de page web.
- Évite les formules robotiques ("Voici ce que j'ai trouvé", "Selon le contexte").
- Reformule le contenu du site avec tes propres mots, en restant fidèle aux faits.
- Utilise "je" et "vous". Propose une suite si utile ("Souhaitez-vous aussi… ?").

Règles :
- Base-toi uniquement sur le contexte fourni. N'invente rien.
- Si l'information manque, dis-le avec tact et oriente vers Contact ou Dénoncer.
- 2 à 5 phrases en général, plus si la question le demande.`
      : `You are the assistant for the DRC General Mine Inspection (IGM) website.

Style:
- Sound like a human advisor: natural, warm, direct.
- Each reply should read like a real chat message, not a webpage excerpt.
- Avoid robotic phrases ("Here's what I found", "According to the context").
- Rephrase site content in your own words while staying faithful to the facts.
- Use "I" and "you". Offer a helpful follow-up when relevant ("Would you also like to know…?").

Rules:
- Rely only on the provided context. Do not invent anything.
- If information is missing, say so tactfully and point to Contact or Report.
- Usually 2 to 5 sentences, more if the question requires it.`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_CHAT_MODEL?.trim() || "gpt-4o-mini",
        temperature: 0.55,
        messages: [
          {
            role: "system",
            content: `${systemPrompt}\n\nContexte du site :\n${context || "(Aucun extrait pertinent — réponds prudemment et oriente vers Contact.)"}`,
          },
          { role: "user", content: question },
        ],
      }),
    });

    if (!response.ok) return null;
    const payload = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = payload.choices?.[0]?.message?.content?.trim();
    return content || null;
  } catch {
    return null;
  }
}

export async function answerChatQuestion(
  locale: SupportedLocale,
  question: string,
): Promise<ChatAnswer> {
  const trimmed = question.trim();
  if (!trimmed) {
    return {
      answer:
        locale === "fr"
          ? "Posez-moi une question sur l'IGM — missions, cartographie, actualités ou signalement."
          : "Ask me about IGM — missions, map, news or reporting.",
      sources: [],
    };
  }

  const faqAnswer = matchFaqAnswer(locale, trimmed);
  if (faqAnswer) return faqAnswer;

  const smallTalk = smallTalkReply(locale, trimmed);
  if (smallTalk) {
    return { answer: smallTalk, sources: [] };
  }

  const knowledge = await getKnowledgeBase(locale);
  const ranked = rankChunks(knowledge, trimmed);
  const contextChunks = ranked.length > 0 ? ranked : fallbackChunks(knowledge);

  const llmAnswer = await answerWithLlm(locale, trimmed, contextChunks);
  if (llmAnswer) {
    return {
      answer: llmAnswer,
      sources: ranked.slice(0, 4).map((item) => ({ title: item.title, url: item.url })),
    };
  }

  if (ranked.length === 0) {
    return {
      answer:
        locale === "fr"
          ? hasOpenAiKey()
            ? "Je n'ai pas trouvé d'élément précis à ce sujet sur le site. Vous pouvez consulter la page Contact ou utiliser le formulaire Dénoncer — je peux aussi vous orienter si vous reformulez votre question."
            : "Je n'ai pas trouvé d'information précise à ce sujet. Pour des réponses plus naturelles, ajoutez OPENAI_API_KEY dans .env.local puis redémarrez le serveur."
          : hasOpenAiKey()
            ? "I couldn't find something specific on that topic. Try the Contact page or Report form — or rephrase your question and I'll try to help."
            : "I couldn't find specific information on that. For more natural replies, add OPENAI_API_KEY to .env.local and restart the server.",
      sources: [],
    };
  }

  const top = ranked[0];
  const excerpt = excerptAroundMatch(top.text, trimmed);

  const answer =
    locale === "fr"
      ? `D'après ce que je sais sur ${top.title.toLowerCase()}, ${excerpt.charAt(0).toLowerCase()}${excerpt.slice(1)}`
      : `From what I know about ${top.title.toLowerCase()}, ${excerpt.charAt(0).toLowerCase()}${excerpt.slice(1)}`;

  return {
    answer,
    sources: ranked.slice(0, 4).map((item) => ({ title: item.title, url: item.url })),
  };
}
