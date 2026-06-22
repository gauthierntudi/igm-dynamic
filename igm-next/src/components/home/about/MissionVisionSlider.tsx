"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

import type { SupportedLocale } from "@/i18n/locales";
import { localizeHref } from "@/i18n/paths";
import type { CmsHomeAbout } from "@/lib/cms/home/types";

type SwiperInstance = {
  destroy: (deleteInstance?: boolean, cleanStyles?: boolean) => void;
};

type SwiperConstructor = new (
  element: HTMLElement,
  options: Record<string, unknown>,
) => SwiperInstance;

declare global {
  interface Window {
    Swiper?: SwiperConstructor;
  }
}

type Card = {
  key: string;
  icon: "globe" | "eye";
  title: string;
  text?: string | null;
  href: string;
};

type Props = {
  mission?: CmsHomeAbout["mission"];
  vision?: CmsHomeAbout["vision"];
  locale: SupportedLocale;
};

function buildCards(
  mission: CmsHomeAbout["mission"],
  vision: CmsHomeAbout["vision"],
  locale: SupportedLocale,
): Card[] {
  const cards: Card[] = [];

  if (mission?.title?.trim()) {
    cards.push({
      key: "mission",
      icon: "globe",
      title: mission.title.trim(),
      text: mission.text,
      href: localizeHref(mission.href?.trim() || "#", locale),
    });
  }

  if (vision?.title?.trim()) {
    cards.push({
      key: "vision",
      icon: "eye",
      title: vision.title.trim(),
      text: vision.text,
      href: localizeHref(vision.href?.trim() || "#", locale),
    });
  }

  return cards;
}

export function MissionVisionSlider({ mission, vision, locale }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const cards = buildCards(mission, vision, locale);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || cards.length === 0) return;

    let swiper: SwiperInstance | null = null;
    let cancelled = false;
    let attempts = 0;

    const init = () => {
      if (cancelled || !rootRef.current) return;

      const SwiperCtor = window.Swiper;
      if (typeof SwiperCtor !== "function") {
        if (attempts < 40) {
          attempts += 1;
          window.setTimeout(init, 50);
        }
        return;
      }

      const pagination = rootRef.current.querySelector(".mission-pagination");

      swiper = new SwiperCtor(rootRef.current, {
        slidesPerView: 1,
        spaceBetween: 20,
        loop: cards.length > 1,
        speed: 600,
        autoplay:
          cards.length > 1
            ? {
                delay: 5000,
                disableOnInteraction: false,
              }
            : false,
        pagination: pagination
          ? {
              el: pagination,
              clickable: true,
              renderBullet: (index: number, className: string) =>
                `<span class="${className}"></span>`,
            }
          : undefined,
      });
    };

    init();

    return () => {
      cancelled = true;
      swiper?.destroy(true, true);
    };
  }, [cards, locale]);

  if (cards.length === 0) return null;

  return (
    <div
      ref={rootRef}
      className="swiper mission-vision-slider"
      data-igm-react-mission-vision="true"
    >
      <div className="swiper-wrapper">
        {cards.map((card) => (
          <div className="swiper-slide" key={card.key}>
            <Link href={card.href} className="mission-vision-link mt-30">
              <div className="icon">
                <i className={`bi bi-${card.icon}`} />
              </div>
              <h5>{card.title}</h5>
              {card.text?.trim() ? <p>{card.text.trim()}</p> : null}
            </Link>
          </div>
        ))}
      </div>
      <div className="mission-pagination dots" />
    </div>
  );
}
