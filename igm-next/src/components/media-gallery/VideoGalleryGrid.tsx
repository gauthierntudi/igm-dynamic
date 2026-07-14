"use client";

import dynamic from "next/dynamic";
import { Play } from "lucide-react";
import { useState } from "react";

import type { SupportedLocale } from "@/i18n/locales";
import { getMessages } from "@/i18n/messages";
import type { ResolvedMediaGalleryItem } from "@/lib/cms/media-gallery/types";

import { VideoThumbnail } from "./VideoThumbnail";

const VideoLightbox = dynamic(
  () => import("./VideoLightbox").then((mod) => ({ default: mod.VideoLightbox })),
  { ssr: false },
);

type Props = {
  locale: SupportedLocale;
  items: ResolvedMediaGalleryItem[];
};

function formatDate(value: string | null | undefined, locale: SupportedLocale): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function VideoGalleryGrid({ locale, items }: Props) {
  const t = getMessages(locale).mediaGalleryPage;
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  if (items.length === 0) {
    return <p className="igm-media-gallery-empty">{t.emptyVideos}</p>;
  }

  return (
    <>
      <div className="igm-media-gallery-grid igm-media-gallery-grid--videos">
        {items.map((item, index) => {
          const dateLabel = formatDate(item.publishedAt, locale);

          return (
            <article key={item.id} className="igm-media-gallery-card igm-media-gallery-card--video">
              <button
                type="button"
                className="igm-media-gallery-card__trigger igm-media-gallery-card__trigger--video"
                onClick={() => setActiveIndex(index)}
                aria-label={`${t.openItem}: ${item.title}`}
              >
                <span className="igm-media-gallery-card__media">
                  <VideoThumbnail posterSrc={item.posterSrc} alt={item.alt} />
                  <span className="igm-media-gallery-card__play" aria-hidden>
                    <span className="igm-media-gallery-card__play-badge">
                      <Play className="igm-media-gallery-card__play-icon" size={44} strokeWidth={0} fill="#ffffff" />
                    </span>
                  </span>
                </span>
                <span className="igm-media-gallery-card__body">
                  <strong className="igm-media-gallery-card__title">{item.title}</strong>
                  {item.summary ? (
                    <span className="igm-media-gallery-card__summary">{item.summary}</span>
                  ) : null}
                  {dateLabel ? (
                    <time className="igm-media-gallery-card__date" dateTime={item.publishedAt ?? undefined}>
                      {dateLabel}
                    </time>
                  ) : null}
                </span>
              </button>
            </article>
          );
        })}
      </div>

      {activeIndex != null ? (
        <VideoLightbox
          locale={locale}
          items={items}
          activeIndex={activeIndex}
          onClose={() => setActiveIndex(null)}
          onIndexChange={setActiveIndex}
        />
      ) : null}
    </>
  );
}
