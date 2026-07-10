"use client";

import { useEffect, useRef } from "react";

import type { SupportedLocale } from "@/i18n/locales";
import { hrefForNewsItem } from "@/i18n/paths";
import { formatNewsDate } from "@/lib/cms/formatNewsDate";
import type { CmsNews } from "@/lib/cms/types";
import { getMessages } from "@/i18n/messages";
import { resolveNewsCategoryLabel } from "@/lib/newsCategories";

import { NewsCard } from "./NewsCard";
import { resolveNewsCoverSrc } from "./resolveNewsMedia";

type Props = {
  items: CmsNews[];
  locale: SupportedLocale;
  /** Grille pleine largeur (page article) ou carrousel (accueil). */
  layout?: "slider" | "grid";
};

type SwiperWindow = Window & {
  Swiper?: new (
    element: HTMLElement,
    options: Record<string, unknown>,
  ) => { destroy: (deleteInstance?: boolean, cleanStyles?: boolean) => void };
};

export function NewsCardsSlider({ items, locale, layout = "slider" }: Props) {
  const sliderRef = useRef<HTMLDivElement>(null);
  const m = getMessages(locale).common;
  const cards = items.map((item, index) => {
    const href = hrefForNewsItem(item, locale);
    const category =
      resolveNewsCategoryLabel(item.category, item.categoryCustom, locale) ||
      m.newsFallback;

    return (
      <NewsCard
        key={item.id}
        href={href}
        coverSrc={resolveNewsCoverSrc(item.cover, index)}
        category={category}
        date={formatNewsDate(item.publishedAt, locale)}
        title={item.title.trim()}
        excerpt={item.excerpt.trim()}
        readMoreLabel={m.readMore}
      />
    );
  });

  useEffect(() => {
    if (layout !== "slider") return;

    const slider = sliderRef.current;
    if (!slider || items.length === 0) return;

    let instance: { destroy: (deleteInstance?: boolean, cleanStyles?: boolean) => void } | null =
      null;
    let attempt = 0;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const init = () => {
      const SwiperCtor = (window as SwiperWindow).Swiper;
      if (typeof SwiperCtor !== "function") return false;
      if ((slider as HTMLElement & { swiper?: unknown }).swiper) return true;

      const pagination = slider.querySelector(".igm-news-pagination");

      instance = new SwiperCtor(slider, {
        slidesPerView: 1.08,
        spaceBetween: 16,
        centeredSlides: true,
        speed: 500,
        watchOverflow: true,
        pagination: pagination
          ? {
              el: pagination,
              clickable: true,
              dynamicBullets: true,
            }
          : undefined,
        breakpoints: {
          768: {
            slidesPerView: 2,
            spaceBetween: 20,
            centeredSlides: false,
          },
          992: {
            slidesPerView: 3,
            spaceBetween: 24,
            centeredSlides: false,
          },
        },
      });

      return true;
    };

    const retry = () => {
      if (init() || attempt >= 30) return;
      attempt += 1;
      timeoutId = setTimeout(retry, 100);
    };

    retry();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      instance?.destroy(true, true);
    };
  }, [items, layout]);

  if (!items.length) return null;

  if (layout === "grid") {
    return <div className="igm-news-grid">{cards}</div>;
  }

  return (
    <div ref={sliderRef} className="swiper igm-news-slider">
      <div className="swiper-wrapper">
        {items.map((item, index) => (
          <div key={item.id} className="swiper-slide">
            {cards[index]}
          </div>
        ))}
      </div>
      <div className="swiper-pagination igm-news-pagination" />
    </div>
  );
}
