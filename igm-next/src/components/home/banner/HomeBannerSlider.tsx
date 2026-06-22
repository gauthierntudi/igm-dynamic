"use client";

import { useEffect, useRef } from "react";

import type { SupportedLocale } from "@/i18n/locales";
import type { CmsHomeBannerSlide } from "@/lib/cms/home/types";

import { HomeBannerSlide } from "./HomeBannerSlide";

type SwiperInstance = {
  destroy: (deleteInstance?: boolean, cleanStyles?: boolean) => void;
  slides?: { getAttribute: (name: string) => string | null }[];
  activeIndex: number;
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

type Props = {
  slides: CmsHomeBannerSlide[];
  locale: SupportedLocale;
};

function setHeaderHeroModeFromSwiper(swiper: SwiperInstance | null | undefined) {
  if (!swiper?.slides) return;
  const activeSlide = swiper.slides[swiper.activeIndex];
  const type = activeSlide?.getAttribute("data-type");
  document.body.classList.toggle("header-hero-dark", type === "slide-image-cover");
}

export function HomeBannerSlider({ slides, locale }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || slides.length === 0) return;

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

      const pagination = rootRef.current.querySelector(".home4-banner-pagination");

      swiper = new SwiperCtor(rootRef.current, {
        slidesPerView: 1,
        spaceBetween: 0,
        loop: slides.length > 1,
        speed: 800,
        effect: "fade",
        fadeEffect: { crossFade: true },
        autoplay:
          slides.length > 1
            ? {
                delay: 4500,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }
            : false,
        pagination: pagination
          ? {
              el: pagination,
              clickable: true,
            }
          : undefined,
        on: {
          init: (instance: SwiperInstance) => {
            setHeaderHeroModeFromSwiper(instance);
          },
          slideChange: (instance: SwiperInstance) => {
            setHeaderHeroModeFromSwiper(instance);
          },
        },
      });

      setHeaderHeroModeFromSwiper(swiper);
    };

    init();

    return () => {
      cancelled = true;
      swiper?.destroy(true, true);
      document.body.classList.remove("header-hero-dark");
    };
  }, [slides, locale]);

  if (!slides.length) return null;

  return (
    <div
      ref={rootRef}
      className="home4-banner-section mb-130 swiper home4-banner-slider"
      data-igm-react-banner="true"
    >
      <div className="swiper-wrapper">
        {slides.map((slide, index) => (
          <HomeBannerSlide
            key={slide.title + index}
            slide={slide}
            index={index}
            locale={locale}
          />
        ))}
      </div>
      <div className="swiper-pagination home4-banner-pagination mb-20" />
    </div>
  );
}

export default HomeBannerSlider;
