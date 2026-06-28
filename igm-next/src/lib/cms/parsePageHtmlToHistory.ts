import { stripHtml } from "@/lib/chat/textUtils";

/** Convertit le HTML CMS en paragraphes compatibles avec HistoryContent (• pour les listes). */
export function htmlToHistoryParagraphs(html: string): string[] {
  const paragraphs: string[] = [];
  const blockPattern = /<(p|ul)[^>]*>([\s\S]*?)<\/\1>/gi;
  let match: RegExpExecArray | null;

  while ((match = blockPattern.exec(html)) !== null) {
    const tag = match[1]?.toLowerCase();
    const inner = match[2] ?? "";

    if (tag === "p") {
      const text = stripHtml(inner).trim();
      if (text) paragraphs.push(text);
      continue;
    }

    if (tag === "ul") {
      for (const li of inner.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)) {
        const text = stripHtml(li[1] ?? "").trim();
        if (text) paragraphs.push(`• ${text}`);
      }
    }
  }

  if (paragraphs.length === 0 && html.trim()) {
    const fallback = stripHtml(html).trim();
    if (fallback) paragraphs.push(fallback);
  }

  return paragraphs;
}
