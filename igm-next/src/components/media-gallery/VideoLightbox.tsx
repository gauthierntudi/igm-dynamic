"use client";

import dynamic from "next/dynamic";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

import type { SupportedLocale } from "@/i18n/locales";
import { getMessages } from "@/i18n/messages";
import type { ResolvedMediaGalleryItem } from "@/lib/cms/media-gallery/types";

import "./media-gallery-page.css";
import "./plyr-igm-theme.css";

const GalleryVideoPlayer = dynamic(
  () => import("./GalleryVideoPlayer").then((mod) => ({ default: mod.GalleryVideoPlayer })),
  {
    ssr: false,
    loading: () => <div className="igm-plyr-wrap igm-plyr-wrap--loading igm-youtube-wrap" aria-hidden />,
  },
);

type Props = {
  locale: SupportedLocale;
  items: ResolvedMediaGalleryItem[];
  activeIndex: number;
  onClose: () => void;
  onIndexChange: (index: number) => void;
};

export function VideoLightbox({ locale, items, activeIndex, onClose, onIndexChange }: Props) {
  const t = getMessages(locale).mediaGalleryPage;
  const closeRef = useRef<HTMLButtonElement>(null);
  const touchStartX = useRef<number | null>(null);

  const activeItem = items[activeIndex];
  const hasMultiple = items.length > 1;
  const counterLabel = t.photoViewerCounter
    .replace("{current}", String(activeIndex + 1))
    .replace("{total}", String(items.length));
  const description = activeItem.caption || activeItem.summary;

  const showPrevious = useCallback(() => {
    onIndexChange((activeIndex - 1 + items.length) % items.length);
  }, [activeIndex, items.length, onIndexChange]);

  const showNext = useCallback(() => {
    onIndexChange((activeIndex + 1) % items.length);
  }, [activeIndex, items.length, onIndexChange]);

  useEffect(() => {
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") showPrevious();
      if (event.key === "ArrowRight") showNext();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose, showNext, showPrevious]);

  const onTouchStart = (event: React.TouchEvent) => {
    touchStartX.current = event.changedTouches[0]?.clientX ?? null;
  };

  const onTouchEnd = (event: React.TouchEvent) => {
    if (touchStartX.current == null || !hasMultiple) return;

    const delta = (event.changedTouches[0]?.clientX ?? 0) - touchStartX.current;
    touchStartX.current = null;

    if (Math.abs(delta) < 48) return;
    if (delta > 0) showPrevious();
    else showNext();
  };

  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="igm-video-lightbox" role="dialog" aria-modal="true" aria-label={activeItem.title}>
      <button
        type="button"
        className="igm-video-lightbox__backdrop"
        onClick={onClose}
        aria-label={t.closeModal}
      />

      <header className="igm-video-lightbox__header">
        <div className="igm-video-lightbox__heading">
          <p className="igm-video-lightbox__title">{activeItem.title}</p>
          {hasMultiple ? <p className="igm-video-lightbox__counter">{counterLabel}</p> : null}
        </div>
        <button
          ref={closeRef}
          type="button"
          className="igm-video-lightbox__close"
          onClick={onClose}
          aria-label={t.closeModal}
        >
          <X size={22} strokeWidth={2} />
        </button>
      </header>

      <div
        className="igm-video-lightbox__stage"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {hasMultiple ? (
          <>
            <button
              type="button"
              className="igm-video-lightbox__nav igm-video-lightbox__nav--prev"
              onClick={showPrevious}
              aria-label={t.previousItem}
            >
              <ChevronLeft size={30} strokeWidth={2} />
            </button>
            <button
              type="button"
              className="igm-video-lightbox__nav igm-video-lightbox__nav--next"
              onClick={showNext}
              aria-label={t.nextItem}
            >
              <ChevronRight size={30} strokeWidth={2} />
            </button>
          </>
        ) : null}

        <GalleryVideoPlayer
          key={activeItem.id}
          embedSrc={activeItem.embedSrc}
          title={activeItem.title}
        />
      </div>

      {description ? (
        <footer className="igm-video-lightbox__footer">
          <p>{description}</p>
        </footer>
      ) : null}
    </div>,
    document.body,
  );
}
