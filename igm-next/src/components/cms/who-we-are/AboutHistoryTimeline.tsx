"use client";

import Link from "next/link";
import { ArrowRight, X } from "lucide-react";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";

import type { SupportedLocale } from "@/i18n/locales";
import { HistoryContent } from "@/lib/cms/who-we-are/parseHistoryContent";
import type { ResolvedHistoryMilestone } from "@/lib/cms/who-we-are/resolveWhoWeArePage";

type Props = {
  locale: SupportedLocale;
  sectionTitle: string;
  introLead?: string;
  introParagraphs: string[];
  events: ResolvedHistoryMilestone[];
};

export function AboutHistoryTimeline({
  locale,
  sectionTitle,
  introLead,
  introParagraphs = [],
  events = [],
}: Props) {
  const isEn = locale === "en";
  const [activeEvent, setActiveEvent] = useState<ResolvedHistoryMilestone | null>(null);
  const [mounted, setMounted] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const modalTitleId = useId();
  const clipPathId = `about-history-arrow-${modalTitleId.replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const clipPathUrl = `url(#${clipPathId})`;

  const copy = {
    hint: isEn ? "Swipe to explore the timeline" : "Faites défiler la frise chronologique",
    close: isEn ? "Close" : "Fermer",
    empty: isEn
      ? "No description available for this event."
      : "Aucune description disponible pour cet événement.",
    scrollLeft: isEn ? "Scroll left" : "Défiler vers la gauche",
    scrollRight: isEn ? "Scroll right" : "Défiler vers la droite",
  };

  const updateScrollState = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;

    const maxScroll = track.scrollWidth - track.clientWidth;
    setCanScrollLeft(track.scrollLeft > 8);
    setCanScrollRight(track.scrollLeft < maxScroll - 8);
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    updateScrollState();
    track.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);

    return () => {
      track.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [events.length, updateScrollState]);

  const closeModal = useCallback(() => setActiveEvent(null), []);
  const openEvent = useCallback((event: ResolvedHistoryMilestone) => setActiveEvent(event), []);

  useEffect(() => {
    if (!activeEvent) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeModal();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [activeEvent, closeModal]);

  const scrollTrack = (direction: "left" | "right") => {
    const track = trackRef.current;
    if (!track) return;
    const amount = Math.max(track.clientWidth * 0.75, 260);
    track.scrollBy({ left: direction === "left" ? -amount : amount, behavior: "smooth" });
  };

  if (!events.length && !introLead && !introParagraphs.length) return null;

  const hasIntro = Boolean(introLead || introParagraphs.length);

  return (
    <>
      <section id="igm-wwa-history" className="about-history-teaser" aria-label={sectionTitle}>
        <div className="about-wrap">
          <header className="about-history-teaser__head">
            <div>
              <h2 className="about-history-teaser__title">{sectionTitle}</h2>
              <span className="about-history-teaser__line" aria-hidden />
            </div>
          </header>

          {hasIntro ? (
            <div className="about-history-teaser__intro">
              {introLead ? <p className="about-history-teaser__lead">{introLead}</p> : null}
              {introParagraphs.length > 0 ? (
                <div className="about-history-teaser__intro-prose">
                  <HistoryContent paragraphs={introParagraphs} />
                </div>
              ) : null}
            </div>
          ) : null}
        </div>

          {events.length ? (
          <div
            className="about-history-timeline about-history-timeline--full"
            style={{ ["--timeline-clip" as string]: clipPathUrl }}
            data-can-scroll-left={canScrollLeft ? "true" : "false"}
            data-can-scroll-right={canScrollRight ? "true" : "false"}
          >
            <svg className="about-history-timeline__clip-def" aria-hidden focusable="false">
              <defs>
                <clipPath id={clipPathId} clipPathUnits="objectBoundingBox">
                  <path d="M 0.869804 0 H 0 L 0.110803 0.471963 L 0 1 H 0.869804 L 1 0.471963 Z" />
                </clipPath>
              </defs>
            </svg>

            <p className="about-history-timeline__hint">{copy.hint}</p>

            <div className="about-history-timeline__controls" aria-hidden>
              <button
                type="button"
                className="about-history-timeline__nav about-history-timeline__nav--prev"
                onClick={() => scrollTrack("left")}
                disabled={!canScrollLeft}
                aria-label={copy.scrollLeft}
                tabIndex={-1}
              >
                <ArrowRight size={18} aria-hidden />
              </button>
              <button
                type="button"
                className="about-history-timeline__nav about-history-timeline__nav--next"
                onClick={() => scrollTrack("right")}
                disabled={!canScrollRight}
                aria-label={copy.scrollRight}
                tabIndex={-1}
              >
                <ArrowRight size={18} aria-hidden />
              </button>
            </div>

            <div ref={trackRef} className="about-history-timeline__viewport" role="list">
              <div className="about-history-timeline__track">
                {events.map((event, index) => {
                  const isTop = index % 2 === 0;
                  const hasCustomBubbleColor = Boolean(event.bubbleColor);
                  const bubbleStyle = hasCustomBubbleColor
                    ? {
                        ["--bubble-color" as string]: event.bubbleColor,
                        ["--bubble-text" as string]: event.bubbleTextColor,
                      }
                    : {
                        ["--segment-color" as string]: event.segmentColor,
                      };

                  return (
                    <article
                      key={event.id}
                      className="about-history-timeline__col"
                      role="listitem"
                      data-position={isTop ? "top" : "bottom"}
                    >
                      <div className="about-history-timeline__slot about-history-timeline__slot--top">
                        {isTop ? (
                          <button
                            type="button"
                            className="about-history-timeline__bubble"
                            style={bubbleStyle}
                            data-custom-bubble-color={hasCustomBubbleColor ? "true" : undefined}
                            onClick={() => openEvent(event)}
                            aria-haspopup="dialog"
                            aria-label={`${event.date} — ${event.title}`}
                          >
                            <span className="about-history-timeline__connector" aria-hidden />
                            <span className="about-history-timeline__bubble-title">{event.title}</span>
                          </button>
                        ) : null}
                      </div>

                      <button
                        type="button"
                        className="about-history-timeline__segment"
                        style={{
                          zIndex: index + 1,
                          background: event.segmentColor,
                          ["--segment-text" as string]: event.segmentTextColor,
                        }}
                        onClick={() => openEvent(event)}
                        aria-haspopup="dialog"
                        aria-label={`${event.date} — ${event.title}`}
                      >
                        <span className="about-history-timeline__segment-year">{event.year}</span>
                      </button>

                      <div className="about-history-timeline__slot about-history-timeline__slot--bottom">
                        {!isTop ? (
                          <button
                            type="button"
                            className="about-history-timeline__bubble"
                            style={bubbleStyle}
                            data-custom-bubble-color={hasCustomBubbleColor ? "true" : undefined}
                            onClick={() => openEvent(event)}
                            aria-haspopup="dialog"
                            aria-label={`${event.date} — ${event.title}`}
                          >
                            <span className="about-history-timeline__connector" aria-hidden />
                            <span className="about-history-timeline__bubble-title">{event.title}</span>
                          </button>
                        ) : null}
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </div>
          ) : null}
      </section>

      {mounted && activeEvent
        ? createPortal(
            <div
              className="about-history-modal"
              role="presentation"
              onMouseDown={(event) => {
                if (event.target === event.currentTarget) closeModal();
              }}
            >
              <section
                className="about-history-modal__panel"
                role="dialog"
                aria-modal="true"
                aria-labelledby={modalTitleId}
              >
                <div className="about-history-modal__handle" aria-hidden />
                <header className="about-history-modal__head">
                  <div>
                    <p className="about-history-modal__date">{activeEvent.date}</p>
                    <h3 id={modalTitleId} className="about-history-modal__title">
                      {activeEvent.title}
                    </h3>
                  </div>
                  <button
                    type="button"
                    className="about-history-modal__close"
                    onClick={closeModal}
                    aria-label={copy.close}
                  >
                    <X size={22} aria-hidden />
                  </button>
                </header>

                <div className="about-history-modal__body">
                  <p
                    className={`about-history-modal__text${
                      activeEvent.description ? "" : " about-history-modal__text--empty"
                    }`}
                  >
                    {activeEvent.description || copy.empty}
                  </p>
                </div>

                {activeEvent.link ? (
                  <footer className="about-history-modal__foot">
                    <Link
                      href={activeEvent.link.href}
                      className="about-history-modal__link"
                      onClick={closeModal}
                    >
                      {activeEvent.link.label}
                      <ArrowRight size={16} aria-hidden />
                    </Link>
                  </footer>
                ) : null}
              </section>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
