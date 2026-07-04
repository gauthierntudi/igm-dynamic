import { afterEach, describe, expect, it } from "vitest";

import {
  hasChatLlmConfigured,
  listChatModelCandidates,
  resolveChatLlmProvider,
} from "../chatModel";

describe("chatModel", () => {
  const env = process.env;

  afterEach(() => {
    process.env = { ...env };
  });

  it("priorise Google en mode auto", () => {
    process.env.CHAT_LLM_PROVIDER = "auto";
    process.env.GOOGLE_GENERATIVE_AI_API_KEY = "test-google";
    process.env.OPENAI_API_KEY = "test-openai";

    expect(resolveChatLlmProvider()).toBe("google");
    expect(hasChatLlmConfigured()).toBe(true);
  });

  it("respecte CHAT_LLM_PROVIDER=groq", () => {
    process.env.CHAT_LLM_PROVIDER = "groq";
    process.env.GROQ_API_KEY = "test-groq";
    delete process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    expect(resolveChatLlmProvider()).toBe("groq");
  });

  it("retourne null sans clé", () => {
    delete process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    delete process.env.GROQ_API_KEY;
    delete process.env.OPENAI_API_KEY;

    expect(resolveChatLlmProvider()).toBeNull();
    expect(hasChatLlmConfigured()).toBe(false);
    expect(listChatModelCandidates()).toEqual([]);
  });

  it("utilise gemini-2.0-flash-lite par défaut pour Google", () => {
    process.env.CHAT_LLM_PROVIDER = "google";
    process.env.GOOGLE_GENERATIVE_AI_API_KEY = "test-google";
    delete process.env.CHAT_MODEL;

    expect(listChatModelCandidates()[0]?.modelId).toBe("gemini-2.0-flash-lite");
  });
});
