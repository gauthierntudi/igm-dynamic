"use client";

import { ChevronLeft, ChevronRight, Loader2, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import type { SupportedLocale } from "@/i18n/locales";
import { getMessages } from "@/i18n/messages";
import type { ResolvedAlbumPhoto } from "@/lib/cms/photo-albums/types";

type Props = {
  locale: SupportedLocale;
  photos: ResolvedAlbumPhoto[];
  activeIndex: number;
  albumTitle: string;
  onClose: () => void;
  onIndexChange: (index: number) => void;
};

export function PhotoLightbox({
  locale,
  photos,
  activeIndex,
  albumTitle,
  onClose,
  onIndexChange,
}: Props) {
  const t = getMessages(locale).mediaGalleryPage;
  const closeRef = useRef<HTMLButtonElement>(null);
  const thumbsRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const activePhoto = photos[activeIndex];
  const hasMultiple = photos.length > 1;
  const counterLabel = t.photoViewerCounter
    .replace("{current}", String(activeIndex + 1))
    .replace("{total}", String(photos.length));

  const showPrevious = useCallback(() => {
    onIndexChange((activeIndex - 1 + photos.length) % photos.length);
  }, [activeIndex, onIndexChange, photos.length]);

  const showNext = useCallback(() => {
    onIndexChange((activeIndex + 1) % photos.length);
  }, [activeIndex, onIndexChange, photos.length]);

  useEffect(() => {
    setIsLoading(true);
  }, [activeIndex, activePhoto.mediaSrc]);

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

  useEffect(() => {
    if (!hasMultiple) return;

    [activeIndex - 1, activeIndex + 1].forEach((index) => {
      const normalized = (index + photos.length) % photos.length;
      const img = new window.Image();
      img.src = photos[normalized].mediaSrc;
    });
  }, [activeIndex, hasMultiple, photos]);

  useEffect(() => {
    const container = thumbsRef.current;
    const activeThumb = container?.querySelector<HTMLElement>("[data-active='true']");
    activeThumb?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [activeIndex]);

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

  return (
    <div
      className="igm-photo-lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={albumTitle}
    >
      <button
        type="button"
        className="igm-photo-lightbox__backdrop"
        onClick={onClose}
        aria-label={t.closeModal}
      />

      <header className="igm-photo-lightbox__header">
        <div className="igm-photo-lightbox__heading">
          <p className="igm-photo-lightbox__album">{albumTitle}</p>
          {hasMultiple ? (
            <p className="igm-photo-lightbox__counter">{counterLabel}</p>
          ) : null}
        </div>
        <button
          ref={closeRef}
          type="button"
          className="igm-photo-lightbox__close"
          onClick={onClose}
          aria-label={t.closeModal}
        >
          <X size={22} strokeWidth={2} />
        </button>
      </header>

      <div
        className="igm-photo-lightbox__stage"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {hasMultiple ? (
          <>
            <button
              type="button"
              className="igm-photo-lightbox__nav igm-photo-lightbox__nav--prev"
              onClick={showPrevious}
              aria-label={t.previousItem}
            >
              <ChevronLeft size={30} strokeWidth={2} />
            </button>
            <button
              type="button"
              className="igm-photo-lightbox__nav igm-photo-lightbox__nav--next"
              onClick={showNext}
              aria-label={t.nextItem}
            >
              <ChevronRight size={30} strokeWidth={2} />
            </button>
          </>
        ) : null}

        <figure className="igm-photo-lightbox__figure">
          {isLoading ? (
            <span className="igm-photo-lightbox__loading" aria-live="polite">
              <Loader2 size={32} strokeWidth={2} aria-hidden />
              {t.photoViewerLoading}
            </span>
          ) : null}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={activePhoto.id}
            className={`igm-photo-lightbox__image${isLoading ? "" : " is-visible"}`}
            src={activePhoto.mediaSrc}
            alt={activePhoto.caption?.trim() || activePhoto.alt || ""}
            onLoad={() => setIsLoading(false)}
          />
        </figure>
      </div>

      {activePhoto.caption?.trim() ? (
        <footer className="igm-photo-lightbox__footer">
          <p>{activePhoto.caption.trim()}</p>
        </footer>
      ) : null}

      {hasMultiple ? (
        <div
          ref={thumbsRef}
          className="igm-photo-lightbox__thumbs"
          aria-label={t.photoViewerThumbnails}
        >
          {photos.map((photo, index) => (
            <button
              key={photo.id}
              type="button"
              data-active={index === activeIndex ? "true" : "false"}
              className={`igm-photo-lightbox__thumb${index === activeIndex ? " is-active" : ""}`}
              onClick={() => onIndexChange(index)}
              aria-label={`${t.openItem}: ${photo.alt}`}
              aria-current={index === activeIndex ? "true" : undefined}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo.mediaSrc} alt="" loading="lazy" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
