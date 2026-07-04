import type { UIMessage, UIMessageStreamWriter } from "ai";

import type { ChatSource } from "./faqAnswers";

export function getLastUserText(messages: UIMessage[]): string {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index];
    if (message?.role !== "user") continue;

    return message.parts
      .filter((part) => part.type === "text")
      .map((part) => part.text)
      .join("\n")
      .trim();
  }

  return "";
}

export function getPriorUserTexts(messages: UIMessage[]): string[] {
  const texts: string[] = [];

  for (const message of messages) {
    if (message.role !== "user") continue;
    const text = getMessageText(message);
    if (text) texts.push(text);
  }

  return texts.slice(0, -1);
}

export function getMessageText(message: UIMessage): string {
  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("\n")
    .trim();
}

export function getMessageSources(message: UIMessage): ChatSource[] {
  const seen = new Set<string>();

  return message.parts.flatMap((part) => {
    if (part.type !== "source-url") return [];
    if (seen.has(part.url)) return [];
    seen.add(part.url);
    return [{ title: part.title?.trim() || part.url, url: part.url }];
  });
}

export function writeTextAnswer(
  writer: UIMessageStreamWriter,
  text: string,
  id = "igm-answer",
): void {
  writer.write({ type: "text-start", id });
  writer.write({ type: "text-delta", id, delta: text });
  writer.write({ type: "text-end", id });
}

export function writeSourceParts(
  writer: UIMessageStreamWriter,
  sources: ChatSource[],
): void {
  const seen = new Set<string>();

  for (const source of sources) {
    const url = source.url.trim();
    if (!url || seen.has(url)) continue;
    seen.add(url);

    writer.write({
      type: "source-url",
      sourceId: url,
      url,
      title: source.title,
    });
  }
}
