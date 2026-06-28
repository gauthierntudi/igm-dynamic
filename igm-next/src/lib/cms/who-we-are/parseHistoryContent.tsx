import Link from "next/link";
import { CircleChevronRight } from "lucide-react";
import type { ReactNode } from "react";

export type HistoryBlock =
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] };

const LINK_PATTERN = /\[([^\]]+)\]\(([^)]+)\)/g;
const LIST_ITEM_PATTERN = /^[•\-–]\s*/;

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

    if (LIST_ITEM_PATTERN.test(trimmed) || trimmed.startsWith("•")) {
      currentList.push(trimmed.replace(LIST_ITEM_PATTERN, ""));
      continue;
    }

    flushList();
    blocks.push({ type: "paragraph", text: trimmed });
  }

  flushList();
  return blocks;
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

type HistoryContentProps = {
  paragraphs: string[];
};

export function HistoryContent({ paragraphs }: HistoryContentProps) {
  const blocks = parseHistoryBlocks(paragraphs);

  let paragraphIndex = 0;

  return (
    <div className="about-history-prose">
      {blocks.map((block, index) => {
        if (block.type === "list") {
          return (
            <ul key={`list-${index}`} className="about-history-list">
              {block.items.map((item) => (
                <li key={item.slice(0, 48)}>
                  <CircleChevronRight className="about-history-list-icon" size={18} strokeWidth={2} aria-hidden />
                  <span>{renderInlineText(item, `list-${index}-${item.slice(0, 12)}`)}</span>
                </li>
              ))}
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
