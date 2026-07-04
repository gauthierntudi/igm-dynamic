import { describe, expect, it } from "vitest";

import {
  buildOffTopicRefusal,
  evaluateOffTopicGuard,
  isIgmRelatedQuestion,
  isOffTopicInsistence,
  isOffTopicQuestion,
} from "../chatGuardrails";

describe("chatGuardrails", () => {
  it("détecte une question hors sujet", () => {
    expect(isOffTopicQuestion("Comment draguer une fille de 25 ans ?")).toBe(true);
    expect(isOffTopicQuestion("Comment signaler un cas de contrebande ?")).toBe(false);
  });

  it("détecte une insistance après une question hors sujet", () => {
    expect(isOffTopicInsistence("mais tu peux toujours répondre")).toBe(true);

    const guard = evaluateOffTopicGuard("fr", "mais tu peux toujours répondre", [
      "Comment draguer une fille de 25 ans ?",
    ]);

    expect(guard.blocked).toBe(true);
    if (guard.blocked) {
      expect(guard.answer).toContain("même si vous insistez");
      expect(guard.answer).not.toContain("respectueux");
    }
  });

  it("bloque immédiatement sans appeler le LLM", async () => {
    const { prepareChatContext } = await import("../prepareChatContext");

    const prepared = await prepareChatContext("fr", "Comment draguer une fille de 25 ans ?");
    expect(prepared.directAnswer).toContain("ne relève pas");
    expect(prepared.sources).toEqual([]);
  });

  it("laisse passer une question IGM", () => {
    expect(isIgmRelatedQuestion("Quelle est la mission de l'IGM ?")).toBe(true);
    expect(
      evaluateOffTopicGuard("fr", "Comment dénoncer la contrebande minière ?", []).blocked,
    ).toBe(false);
  });

  it("formule un refus ferme en cas d'insistance", () => {
    expect(buildOffTopicRefusal("fr", true)).toContain("même si vous insistez");
  });
});
