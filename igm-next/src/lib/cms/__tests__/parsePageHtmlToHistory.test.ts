import { describe, expect, it } from "vitest";

import {
  HISTORY_LIST_BREAK,
  htmlToHistoryBlocks,
  htmlToHistoryParagraphs,
} from "@/lib/cms/parsePageHtmlToHistory";
import { parseHistoryBlocks } from "@/lib/cms/who-we-are/parseHistoryContent";

describe("htmlToHistoryBlocks", () => {
  it("sépare les blocs ul consécutifs du CMS", () => {
    const html = `
      <p>Introduction :</p>
      <ul><li>Premier</li><li>Deuxième</li></ul>
      <ul><li>Troisième</li></ul>
    `;

    expect(htmlToHistoryBlocks(html)).toEqual([
      { type: "paragraph", text: "Introduction :" },
      { type: "list", items: ["Premier", "Deuxième"] },
      { type: "list", items: ["Troisième"] },
    ]);
  });

  it("imbrique les items après un libellé terminant par : dans un seul ul", () => {
    const html = `<ul>
      <li>Sécuriser les corridors</li>
      <li>Renforcer les contrôles</li>
      <li>Démanteler les réseaux en collaboration avec :</li>
      <li>La DGDA</li>
      <li>La Police Nationale Congolaise</li>
    </ul>`;

    expect(htmlToHistoryBlocks(html)).toEqual([
      {
        type: "list",
        items: [
          "Sécuriser les corridors",
          "Renforcer les contrôles",
          {
            text: "Démanteler les réseaux en collaboration avec :",
            subItems: ["La DGDA", "La Police Nationale Congolaise"],
          },
        ],
      },
    ]);
  });

  it("fusionne deux ul consécutifs quand le dernier item du premier se termine par :", () => {
    const html = `
      <ul>
        <li>Sécuriser les corridors</li>
        <li>Renforcer les contrôles</li>
        <li>Démanteler les réseaux en collaboration avec :</li>
      </ul>
      <ul>
        <li>La DGDA</li>
        <li>La Police Nationale Congolaise</li>
      </ul>
    `;

    expect(htmlToHistoryBlocks(html)).toEqual([
      {
        type: "list",
        items: [
          "Sécuriser les corridors",
          "Renforcer les contrôles",
          {
            text: "Démanteler les réseaux en collaboration avec :",
            subItems: ["La DGDA", "La Police Nationale Congolaise"],
          },
        ],
      },
    ]);
  });

  it("conserve les intertitres Lexical (h1–h6) comme paragraphes", () => {
    const html = `
      <p>Introduction.</p>
      <h5>Selon ces textes, les sanctions visent à réprimer :</h5>
      <ul><li>Premier</li><li>Deuxième</li></ul>
      <h4>Les sanctions prévues peuvent notamment inclure :</h4>
      <ul><li>Amendes</li></ul>
    `;

    expect(htmlToHistoryBlocks(html)).toEqual([
      { type: "paragraph", text: "Introduction." },
      { type: "paragraph", text: "Selon ces textes, les sanctions visent à réprimer :" },
      { type: "list", items: ["Premier", "Deuxième"] },
      { type: "paragraph", text: "Les sanctions prévues peuvent notamment inclure :" },
      { type: "list", items: ["Amendes"] },
    ]);
  });

});

describe("htmlToHistoryParagraphs", () => {
  it("convertit les blocs structurés en lignes avec séparateurs", () => {
    const html = `
      <p>Introduction :</p>
      <ul><li>Premier</li><li>Deuxième</li></ul>
      <ul><li>Troisième</li></ul>
    `;

    expect(htmlToHistoryParagraphs(html)).toEqual([
      "Introduction :",
      "• Premier",
      "• Deuxième",
      HISTORY_LIST_BREAK,
      "• Troisième",
    ]);
  });
});

describe("parseHistoryBlocks", () => {
  it("produit des listes distinctes à partir des séparateurs HTML", () => {
    const blocks = parseHistoryBlocks([
      "Actions :",
      "• Sécuriser les corridors",
      "• Renforcer les contrôles",
      "• Démanteler les réseaux en collaboration avec :",
      HISTORY_LIST_BREAK,
      "• La DGDA",
      "• La Police Nationale Congolaise",
      HISTORY_LIST_BREAK,
    ]);

    expect(blocks).toHaveLength(2);
    expect(blocks[0]).toEqual({ type: "paragraph", text: "Actions :" });
    expect(blocks[1]).toEqual({
      type: "list",
      items: [
        "Sécuriser les corridors",
        "Renforcer les contrôles",
        {
          text: "Démanteler les réseaux en collaboration avec :",
          subItems: ["La DGDA", "La Police Nationale Congolaise"],
        },
      ],
    });
  });

  it("conserve le regroupement des puces consécutives sans séparateur", () => {
    const blocks = parseHistoryBlocks(["• A", "• B", "Texte", "• C"]);

    expect(blocks).toEqual([
      { type: "list", items: ["A", "B"] },
      { type: "paragraph", text: "Texte" },
      { type: "list", items: ["C"] },
    ]);
  });
});
