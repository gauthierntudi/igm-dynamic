import type { ResolvedWhoWeArePage } from "./resolveWhoWeArePage";

/** Longueur max du titre hero Historique (~2 lignes sur desktop). */
export const HISTORY_HERO_MAX_CHARS = 72;

function stripMarkdown(text: string): string {
  return text.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
}

function clampHeroPhrase(text: string, fallback: string): string {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (!cleaned) return fallback;
  if (cleaned.length <= HISTORY_HERO_MAX_CHARS) return cleaned;

  const truncated = cleaned.slice(0, HISTORY_HERO_MAX_CHARS);
  const lastSpace = truncated.lastIndexOf(" ");
  const cut = lastSpace > 32 ? truncated.slice(0, lastSpace) : truncated.trimEnd();
  return `${cut}…`;
}

/** Phrase courte pour le hero Historique, jamais trop longue. */
export function getHistoryHeroTitle(
  page: Pick<ResolvedWhoWeArePage, "history" | "nav">,
): string {
  const fallback = page.nav.history;

  if (page.history.headline) {
    return clampHeroPhrase(page.history.headline, fallback);
  }

  const firstParagraph = page.history.paragraphs.find(
    (line) => line.trim() && !/^[•\-–]/.test(line.trim()),
  );
  if (!firstParagraph) return fallback;

  const text = stripMarkdown(firstParagraph);
  const sentence = text.match(/^[^.]+\./)?.[0]?.trim() ?? text;
  return clampHeroPhrase(sentence, fallback);
}
