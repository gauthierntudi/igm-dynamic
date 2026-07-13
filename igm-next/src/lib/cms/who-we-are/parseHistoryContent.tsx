import Link from "next/link";
import { CircleChevronRight } from "lucide-react";
import type { ReactNode } from "react";

import { HISTORY_LIST_BREAK } from "@/lib/cms/parsePageHtmlToHistory";

export type HistoryListItem =
  | string
  | {
      text: string;
      subItems: string[];
    };

export type HistoryBlock =
  | { type: "paragraph"; text: string }
  | { type: "list"; items: HistoryListItem[] };

const LINK_PATTERN = /\[([^\]]+)\]\(([^)]+)\)/g;
const LIST_ITEM_PATTERN = /^[•\-–]\s*/;

function isIntroductoryListItem(text: string): boolean {
  return text.trimEnd().endsWith(":");
}

function attachSubLists(blocks: HistoryBlock[]): HistoryBlock[] {
  const result: HistoryBlock[] = [];

  for (let index = 0; index < blocks.length; index += 1) {
    const block = blocks[index];
    const nextBlock = blocks[index + 1];

    if (
      block.type === "list" &&
      nextBlock?.type === "list" &&
      block.items.length > 0 &&
      typeof block.items[block.items.length - 1] === "string" &&
      isIntroductoryListItem(block.items[block.items.length - 1] as string)
    ) {
      const items = [...block.items];
      const introText = items.pop() as string;

      result.push({
        type: "list",
        items: [
          ...items,
          {
            text: introText,
            subItems: nextBlock.items.filter((item): item is string => typeof item === "string"),
          },
        ],
      });
      index += 1;
      continue;
    }

    result.push(block);
  }

  return result;
}

export function parseHistoryBlocks(paragraphs: string[]): HistoryBlock[] {
  const blocks: HistoryBlock[] = [];
  let currentList: string[] = [];

  const flushList = () => {
    if (currentList.length) {
      blocks.push({ type: "list", items: currentList });
      currentList = [];
    }
  };

  for (const line of paragraphs) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (trimmed === HISTORY_LIST_BREAK) {
      flushList();
      continue;
    }

    if (LIST_ITEM_PATTERN.test(trimmed) || trimmed.startsWith("•")) {
      currentList.push(trimmed.replace(LIST_ITEM_PATTERN, ""));
      continue;
    }

    flushList();
    blocks.push({ type: "paragraph", text: trimmed });
  }

  flushList();
  return attachSubLists(blocks);
}

function renderInlineText(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let matchIndex = 0;

  for (const match of text.matchAll(LINK_PATTERN)) {
    const [full, label, href] = match;
    const start = match.index ?? 0;

    if (start > lastIndex) {
      nodes.push(text.slice(lastIndex, start));
    }

    const isExternal = /^https?:\/\//i.test(href);
    nodes.push(
      isExternal ? (
        <a
          key={`${keyPrefix}-link-${matchIndex}`}
          href={href}
          className="about-history-link"
          target="_blank"
          rel="noopener noreferrer"
        >
          {label}
        </a>
      ) : (
        <Link key={`${keyPrefix}-link-${matchIndex}`} href={href} className="about-history-link">
          {label}
        </Link>
      ),
    );

    lastIndex = start + full.length;
    matchIndex += 1;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes.length ? nodes : [text];
}

function paragraphClassName(text: string, paragraphIndex: number): string {
  if (paragraphIndex === 0) return "about-history-lead";
  if (text.endsWith(":")) return "about-history-subhead";
  return "about-history-paragraph";
}

function ListItemIcon({ nested }: { nested: boolean }) {
  if (nested) {
    return <span className="about-history-list-marker about-history-list-marker--sub" aria-hidden />;
  }

  return (
    <CircleChevronRight className="about-history-list-icon about-history-list-icon--main" size={18} strokeWidth={2} aria-hidden />
  );
}

function renderListItems(items: HistoryListItem[], listIndex: number, nested = false): ReactNode[] {
  return items.map((item, itemIndex) => {
    if (typeof item === "string") {
      const key = `list-${listIndex}-item-${itemIndex}-${item.slice(0, 24)}`;

      return (
        <li key={key}>
          <ListItemIcon nested={nested} />
          <span>{renderInlineText(item, key)}</span>
        </li>
      );
    }

    const key = `list-${listIndex}-sub-${itemIndex}-${item.text.slice(0, 24)}`;

    return (
      <li key={key} className="about-history-list__item--with-sublist">
        <ListItemIcon nested={nested} />
        <div className="about-history-list__item-body">
          <span>{renderInlineText(item.text, key)}</span>
          <ul className={`about-history-list${nested ? "" : " about-history-list--nested"}`}>
            {renderListItems(item.subItems, listIndex, true)}
          </ul>
        </div>
      </li>
    );
  });
}

type HistoryContentProps = {
  paragraphs?: string[];
  blocks?: HistoryBlock[];
};

export function HistoryContent({ paragraphs, blocks }: HistoryContentProps) {
  const resolvedBlocks = blocks ?? parseHistoryBlocks(paragraphs ?? []);

  let paragraphIndex = 0;

  return (
    <div className="about-history-prose">
      {resolvedBlocks.map((block, index) => {
        if (block.type === "list") {
          return (
            <ul key={`list-${index}`} className="about-history-list">
              {renderListItems(block.items, index)}
            </ul>
          );
        }

        const currentParagraphIndex = paragraphIndex;
        paragraphIndex += 1;

        return (
          <p
            key={block.text.slice(0, 48)}
            className={paragraphClassName(block.text, currentParagraphIndex)}
          >
            {renderInlineText(block.text, `p-${index}`)}
          </p>
        );
      })}
    </div>
  );
}
