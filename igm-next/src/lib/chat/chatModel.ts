import { createGroq } from "@ai-sdk/groq";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import type { LanguageModel } from "ai";

export type ChatLlmProvider = "auto" | "google" | "groq" | "openai";

export type ChatModelCandidate = {
  provider: Exclude<ChatLlmProvider, "auto">;
  model: LanguageModel;
  modelId: string;
};

function readProvider(): ChatLlmProvider {
  const raw = process.env.CHAT_LLM_PROVIDER?.trim().toLowerCase();
  if (raw === "google" || raw === "groq" || raw === "openai") return raw;
  return "auto";
}

function hasGoogleKey(): boolean {
  return Boolean(process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim());
}

function hasGroqKey(): boolean {
  return Boolean(process.env.GROQ_API_KEY?.trim());
}

function hasOpenAiKey(): boolean {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}

/** True si au moins un fournisseur LLM est configuré. */
export function hasChatLlmConfigured(): boolean {
  return hasGoogleKey() || hasGroqKey() || hasOpenAiKey();
}

export function resolveChatLlmProvider(): ChatLlmProvider | null {
  const configured = readProvider();

  if (configured === "google" && hasGoogleKey()) return "google";
  if (configured === "groq" && hasGroqKey()) return "groq";
  if (configured === "openai" && hasOpenAiKey()) return "openai";

  if (configured !== "auto") return null;

  if (hasGoogleKey()) return "google";
  if (hasGroqKey()) return "groq";
  if (hasOpenAiKey()) return "openai";

  return null;
}

function googleModel(modelId: string): ChatModelCandidate {
  const google = createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
  });
  return { provider: "google", model: google(modelId), modelId };
}

function groqModel(modelId: string): ChatModelCandidate {
  const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });
  return { provider: "groq", model: groq(modelId), modelId };
}

function openaiModel(modelId: string): ChatModelCandidate {
  const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return { provider: "openai", model: openai(modelId), modelId };
}

/** Modèles à essayer dans l'ordre (fallback si quota / erreur API). */
export function listChatModelCandidates(): ChatModelCandidate[] {
  const configured = readProvider();
  const customModel = process.env.CHAT_MODEL?.trim();
  const candidates: ChatModelCandidate[] = [];

  const addGoogle = (modelId?: string) => {
    if (!hasGoogleKey()) return;
    candidates.push(googleModel(modelId || customModel || "gemini-2.0-flash-lite"));
  };

  const addGroq = (modelId?: string) => {
    if (!hasGroqKey()) return;
    candidates.push(groqModel(modelId || customModel || "llama-3.3-70b-versatile"));
  };

  const addOpenAi = (modelId?: string) => {
    if (!hasOpenAiKey()) return;
    candidates.push(
      openaiModel(modelId || customModel || process.env.OPENAI_CHAT_MODEL?.trim() || "gpt-4o-mini"),
    );
  };

  if (configured === "google") {
    addGoogle();
    return candidates;
  }

  if (configured === "groq") {
    addGroq();
    return candidates;
  }

  if (configured === "openai") {
    addOpenAi();
    return candidates;
  }

  addGoogle();
  addGroq();
  addOpenAi();
  return candidates;
}

export function getChatLanguageModel(): LanguageModel | null {
  return listChatModelCandidates()[0]?.model ?? null;
}
