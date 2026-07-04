import { describe, expect, it } from "vitest";

import {
  buildLocationAnswer,
  extractAddressFromChunk,
  filterPublicSources,
  isLocationQuestion,
} from "../chatIntents";
import { resolveContactLocationAnswer } from "../prepareChatContext";
import { sanitizeChatText } from "../textUtils";

describe("sanitizeChatText", () => {
  it("supprime les URLs internes Payload et les noms de fichiers", () => {
    const dirty =
      "diapo Mission image Felix /api/media/file/Felix-Antoine-Tshisekedi-1782083432052.jpg?prefix=public Felix-Antoine-Tshisekedi-1782083432052.jpg Mission IGM";

    const clean = sanitizeChatText(dirty);

    expect(clean).not.toContain("/api/media/file/");
    expect(clean).not.toContain(".jpg");
    expect(clean).not.toContain("?prefix=");
    expect(clean).toContain("Mission IGM");
  });
});

describe("location intent", () => {
  it("détecte une question sur le bureau à Kinshasa", () => {
    expect(isLocationQuestion("IGM a-t-il un bureau à Kin ?")).toBe(true);
  });

  it("répond avec l'adresse sans fuite technique", () => {
    const answer = resolveContactLocationAnswer("fr", "IGM a-t-il un bureau à Kin ?", [
      {
        id: "contact",
        title: "Contact IGM — Numéro vert",
        url: "/contact",
        text: "Adresse du siège : No. 4808, Avenue Tabu Ley, Kinshasa-Gombe. Numéro vert IGM : +243 97 684 4563",
      },
    ]);

    expect(answer?.directAnswer).toContain("Kinshasa");
    expect(answer?.directAnswer).not.toContain("/api/");
    expect(answer?.sources).toEqual([{ title: "Contact IGM", url: "/contact" }]);
  });

  it("filtre les sources non publiques", () => {
    expect(
      filterPublicSources([
        { title: "Ok", url: "/contact" },
        { title: "Bad", url: "/api/media/file/x.jpg" },
        { title: "Bad2", url: "/page?prefix=public" },
      ]),
    ).toEqual([{ title: "Ok", url: "/contact" }]);
  });

  it("extrait l'adresse depuis le chunk contact", () => {
    expect(
      extractAddressFromChunk({
        id: "contact",
        title: "Contact",
        url: "/contact",
        text: "Adresse du siège : No. 4808, Kinshasa-Gombe. E-mail : info@example.com",
      }),
    ).toBe("No. 4808, Kinshasa-Gombe");
  });

  it("formule une réponse bureau en français", () => {
    const answer = buildLocationAnswer("fr", "No. 4808, Kinshasa-Gombe");
    expect(answer.answer).toContain("Kinshasa");
    expect(answer.answer).toContain("No. 4808, Kinshasa-Gombe");
  });
});
