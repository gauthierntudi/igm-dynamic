import { describe, expect, it } from "vitest";

import {
  buildGreenNumberAnswer,
  extractPhoneFromChunk,
  isCartographyCoverageQuestion,
  isContactPhoneQuestion,
  isGreenNumberQuestion,
} from "../chatIntents";
import { buildCartographyCoverageAnswer } from "@/lib/cartography/chatFacts";
import { getLastUserText, getMessageSources } from "../chatMessageUtils";
import { prepareChatContext, resolveContactPhoneAnswer } from "../prepareChatContext";
import type { UIMessage } from "ai";

describe("chatIntents", () => {
  it("détecte une question sur le numéro vert", () => {
    expect(isGreenNumberQuestion("je vais savoir si IGM a un numéro vert ?")).toBe(true);
    expect(isContactPhoneQuestion("comment appeler l'IGM ?")).toBe(true);
  });

  it("extrait le numéro vert d'un chunk contact", () => {
    const phone = extractPhoneFromChunk({
      id: "contact",
      title: "Contact",
      url: "/contact",
      text: "Numéro vert IGM : +243 97 684 4563",
    });

    expect(phone).toBe("+243 97 684 4563");
  });

  it("formule une réponse claire en français", () => {
    const answer = buildGreenNumberAnswer("fr", "+243 97 684 4563");
    expect(answer.answer).toContain("+243 97 684 4563");
    expect(answer.answer).toContain("numéro vert");
  });

  it("détecte une question sur la couverture provinciale", () => {
    expect(isCartographyCoverageQuestion("combien de provinces couvre l'IGM ?")).toBe(true);
    expect(isCartographyCoverageQuestion("la RDC a 25 provinces")).toBe(true);
    expect(isCartographyCoverageQuestion("quelle est la mission de l'IGM ?")).toBe(false);
  });

  it("formule la couverture selon la cartographie du site", () => {
    const answer = buildCartographyCoverageAnswer("fr");
    expect(answer.answer).toContain("26 provinces");
    expect(answer.answer).toContain("22 provinces");
    expect(answer.answer).not.toContain("25 provinces");
  });
});

describe("prepareChatContext", () => {
  it("retourne une réponse directe pour le small talk", async () => {
    const prepared = await prepareChatContext("fr", "bonjour");
    expect(prepared.directAnswer).toContain("assistant IGM");
    expect(prepared.sources).toEqual([]);
  });

  it("construit un prompt système en anglais", async () => {
    const prepared = await prepareChatContext("en", "Tell me about compliance audits in 2026");
    expect(prepared.systemPrompt).toContain("General Mine Inspection");
    expect(prepared.directAnswer).toBeUndefined();
  });

  it("résout le numéro vert sans citer une actualité", () => {
    const prepared = resolveContactPhoneAnswer(
      "fr",
      "je vais savoir si IGM a un numéro vert ?",
      [
        {
          id: "contact",
          title: "Contact IGM — Numéro vert",
          url: "/contact",
          text: "Numéro vert IGM : +243 97 684 4563",
        },
      ],
    );

    expect(prepared?.directAnswer).toMatch(/num[eé]ro vert/i);
    expect(prepared?.directAnswer).toMatch(/\+243 97 684 4563/);
    expect(prepared?.directAnswer).not.toContain("D'après ce que je sais");
    expect(prepared?.sources).toHaveLength(1);
  });

  it("répond sans LLM sur la couverture provinciale IGM", async () => {
    const prepared = await prepareChatContext(
      "fr",
      "Dans combien de provinces l'IGM est-elle présente ?",
    );

    expect(prepared.directAnswer).toContain("26 provinces");
    expect(prepared.directAnswer).toContain("22 provinces");
    expect(prepared.directAnswer).not.toContain("25 provinces");
    expect(prepared.sources[0]?.url).toContain("cartographie");
  });
});

describe("chatMessageUtils", () => {
  it("extrait le dernier message utilisateur", () => {
    const messages: UIMessage[] = [
      {
        id: "1",
        role: "user",
        parts: [{ type: "text", text: "Première question" }],
      },
      {
        id: "2",
        role: "assistant",
        parts: [{ type: "text", text: "Réponse" }],
      },
      {
        id: "3",
        role: "user",
        parts: [{ type: "text", text: "Deuxième question" }],
      },
    ];

    expect(getLastUserText(messages)).toBe("Deuxième question");
  });

  it("extrait les sources source-url", () => {
    const message: UIMessage = {
      id: "a1",
      role: "assistant",
      parts: [
        { type: "text", text: "Réponse" },
        {
          type: "source-url",
          sourceId: "/contact",
          url: "/contact",
          title: "Contact",
        },
      ],
    };

    expect(getMessageSources(message)).toEqual([{ title: "Contact", url: "/contact" }]);
  });
});
