import { stripHtml } from "@/lib/chat/textUtils";
import type { HistoryBlock, HistoryListItem } from "@/lib/cms/who-we-are/parseHistoryContent";

/** Séparateur interne : chaque bloc `<ul>` / `<ol>` du CMS reste une liste distincte. */
export const HISTORY_LIST_BREAK = "__HISTORY_LIST_BREAK__";

const BLOCK_PATTERN = /<(p|ul|ol)[^>]*>([\s\S]*?)<\/\1>/gi;
const LI_PATTERN = /<li[^>]*>([\s\S]*?)<\/li>/gi;
const NESTED_LIST_PATTERN = /<(ul|ol)[^>]*>([\s\S]*?)<\/\1>/i;

function isIntroductoryItem(text: string): boolean {
  return text.trimEnd().endsWith(":");
}

function attachTrailingSubItems(items: HistoryListItem[]): HistoryListItem[] {
  for (let index = 0; index < items.length; index += 1) {
    const item = items[index];
    if (typeof item !== "string" || !isIntroductoryItem(item) || index >= items.length - 1) {
      continue;
    }

    const trailing = items.slice(index + 1);
    if (trailing.every((entry) => typeof entry === "string")) {
      return [
        ...items.slice(0, index),
        { text: item, subItems: trailing as string[] },
      ];
    }
  }

  return items;
}

function parseListItems(inner: string): HistoryListItem[] {
  const items: HistoryListItem[] = [];

  for (const match of inner.matchAll(LI_PATTERN)) {
    const liInner = match[1] ?? "";
    const nestedMatch = liInner.match(NESTED_LIST_PATTERN);

    if (nestedMatch) {
      const text = stripHtml(liInner.replace(nestedMatch[0], "")).trim();
      const subItems = parseListItems(nestedMatch[2] ?? "").flatMap((entry) =>
        typeof entry === "string" ? [entry] : [entry.text, ...entry.subItems],
      );

      if (text && subItems.length > 0) {
        items.push({ text, subItems });
        continue;
      }
    }

    const text = stripHtml(liInner).trim();
    if (text) items.push(text);
  }

  return attachTrailingSubItems(items);
}

function mergeConsecutiveLists(blocks: HistoryBlock[]): HistoryBlock[] {
  const result: HistoryBlock[] = [];

  for (let index = 0; index < blocks.length; index += 1) {
    const block = blocks[index];
    const nextBlock = blocks[index + 1];

    if (block.type === "list" && nextBlock?.type === "list" && block.items.length > 0) {
      const lastItem = block.items[block.items.length - 1];

      if (typeof lastItem === "string" && isIntroductoryItem(lastItem)) {
        result.push({
          type: "list",
          items: [
            ...block.items.slice(0, -1),
            {
              text: lastItem,
              subItems: nextBlock.items.filter((item): item is string => typeof item === "string"),
            },
          ],
        });
        index += 1;
        continue;
      }
    }

    result.push(block);
  }

  return result;
}

/** Dernier paragraphe HTML du contenu CMS (bandeau CTA en bas de page). */
export function extractClosingParagraphFromHtml(html: string): string {
  const matches = [...html.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)];
  if (!matches.length) return "";

  return stripHtml(matches.at(-1)?.[1] ?? "").trim();
}

/** Convertit le HTML CMS en blocs structurés (paragraphes, listes, sous-listes). */
export function htmlToHistoryBlocks(html: string): HistoryBlock[] {
  const blocks: HistoryBlock[] = [];
  let match: RegExpExecArray | null;

  while ((match = BLOCK_PATTERN.exec(html)) !== null) {
    const tag = match[1]?.toLowerCase();
    const inner = match[2] ?? "";

    if (tag === "p") {
      const text = stripHtml(inner).trim();
      if (text) blocks.push({ type: "paragraph", text });
      continue;
    }

    if (tag === "ul" || tag === "ol") {
      const items = parseListItems(inner);
      if (items.length > 0) {
        blocks.push({ type: "list", items });
      }
    }
  }

  if (blocks.length === 0 && html.trim()) {
    const fallback = stripHtml(html).trim();
    if (fallback) blocks.push({ type: "paragraph", text: fallback });
  }

  return mergeConsecutiveLists(blocks);
}

export function splitHistoryContentFromHtml(html: string): {
  bodyBlocks: HistoryBlock[];
  closingText: string;
} {
  const blocks = htmlToHistoryBlocks(html);
  const closingText = extractClosingParagraphFromHtml(html);

  if (!closingText || blocks.length <= 1) {
    return { bodyBlocks: blocks, closingText: "" };
  }

  const lastBlock = blocks.at(-1);
  if (lastBlock?.type === "paragraph" && lastBlock.text === closingText) {
    return {
      bodyBlocks: blocks.slice(0, -1),
      closingText,
    };
  }

  return { bodyBlocks: blocks, closingText: "" };
}

/** Convertit le HTML CMS en paragraphes compatibles avec HistoryContent (• pour les listes). */
export function htmlToHistoryParagraphs(html: string): string[] {
  const paragraphs: string[] = [];

  for (const block of htmlToHistoryBlocks(html)) {
    if (block.type === "paragraph") {
      paragraphs.push(block.text);
      continue;
    }

    for (const item of block.items) {
      if (typeof item === "string") {
        paragraphs.push(`• ${item}`);
        continue;
      }

      paragraphs.push(`• ${item.text}`);
      for (const subItem of item.subItems) {
        paragraphs.push(`• ${subItem}`);
      }
    }

    paragraphs.push(HISTORY_LIST_BREAK);
  }

  if (paragraphs.at(-1) === HISTORY_LIST_BREAK) {
    paragraphs.pop();
  }

  return paragraphs;
}
