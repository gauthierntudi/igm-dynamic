"use client";

import { useState } from "react";

import type { SupportedLocale } from "@/i18n/locales";
import { getMessages } from "@/i18n/messages";

type Props = {
  articleUrl: string;
  title: string;
  locale: SupportedLocale;
};

function shareLinks(articleUrl: string, title: string) {
  const encodedUrl = encodeURIComponent(articleUrl);
  const encodedTitle = encodeURIComponent(title);

  return [
    {
      id: "facebook",
      label: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      icon: "bi-facebook",
    },
    {
      id: "linkedin",
      label: "LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      icon: "bi-linkedin",
    },
    {
      id: "x",
      label: "X",
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      icon: "bi-twitter-x",
    },
  ];
}

export function ArticleShareSidebar({ articleUrl, title, locale }: Props) {
  const m = getMessages(locale).newsArticle;
  const [copied, setCopied] = useState(false);
  const links = shareLinks(articleUrl, title);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(articleUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="igm-news-article-share">
      <p className="igm-news-article-share-title">{m.shareTitle}</p>
      <ul className="igm-news-article-share-list">
        {links.map((item) => (
          <li key={item.id}>
            <a
              href={item.href}
              className="igm-news-article-share-btn"
              target="_blank"
              rel="noopener noreferrer"
              aria-label={item.label}
            >
              <i className={`bi ${item.icon}`} aria-hidden />
            </a>
          </li>
        ))}
        <li>
          <button
            type="button"
            className="igm-news-article-share-btn"
            onClick={handleCopy}
            aria-label={copied ? m.copyLinkDone : m.copyLink}
          >
            <i className="bi bi-link-45deg" aria-hidden />
          </button>
        </li>
      </ul>
    </div>
  );
}
