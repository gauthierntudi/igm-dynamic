"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef } from "react";

import type { SupportedLocale } from "@/i18n/locales";
import { hrefForNewsArticle } from "@/i18n/paths";
import { formatNewsDate } from "@/lib/cms/formatNewsDate";
import type { CmsNews } from "@/lib/cms/types";
import { getMessages } from "@/i18n/messages";
import { resolveNewsCategoryLabel } from "@/lib/newsCategories";
import { truncateNewsCardText } from "@/lib/newsDisplay";
import {
  NEWS_LISTING_HERO_EXCERPT_MAX,
  NEWS_LISTING_HERO_TITLE_MAX,
} from "@/lib/newsListing";

import { resolveNewsCoverSrc } from "@/components/home/news/resolveNewsMedia";

type SwiperInstance = {
  destroy: (deleteInstance?: boolean, cleanStyles?: boolean) => void;
};

type Props = {
  articles: CmsNews[];
  locale: SupportedLocale;
  sectionLabel: string;
};

export function NewsListingHeroSlider({ articles, locale, sectionLabel }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const m = getMessages(locale).common;

  useEffect(() => {
    document.body.classList.add("header-hero-dark");
    return () => document.body.classList.remove("header-hero-dark");
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || articles.length === 0) return;

    let swiper: SwiperInstance | null = null;
    let cancelled = false;
    let attempts = 0;

    const init = () => {
      if (cancelled || !rootRef.current) return;
      const SwiperCtor = (window as Window & { Swiper?: new (...args: unknown[]) => SwiperInstance })
        .Swiper;
      if (typeof SwiperCtor !== "function") {
        if (attempts < 40) {
          attempts += 1;
          window.setTimeout(init, 50);
        }
        return;
      }

      const pagination = rootRef.current.querySelector(".igm-news-listing-hero-pagination");
      const prev = rootRef.current.querySelector(".igm-news-listing-hero-prev");
      const next = rootRef.current.querySelector(".igm-news-listing-hero-next");

      swiper = new SwiperCtor(rootRef.current, {
        slidesPerView: 1,
        loop: articles.length > 1,
        speed: 700,
        effect: "fade",
        fadeEffect: { crossFade: true },
        autoplay:
          articles.length > 1
            ? { delay: 5500, disableOnInteraction: false, pauseOnMouseEnter: true }
            : false,
        pagination: pagination
          ? { el: pagination, clickable: true, dynamicBullets: false }
          : undefined,
        navigation:
          prev && next
            ? { prevEl: prev, nextEl: next }
            : undefined,
      });
    };

    init();
    return () => {
      cancelled = true;
      swiper?.destroy(true, true);
    };
  }, [articles]);

  if (!articles.length) return null;

  return (
    <section className="igm-news-listing-hero" aria-label={sectionLabel}>
      <div ref={rootRef} className="swiper igm-news-listing-hero-swiper">
        <div className="swiper-wrapper">
          {articles.map((article, index) => {
            const href = hrefForNewsArticle(article.slug, locale);
            const category =
              resolveNewsCategoryLabel(article.category, article.categoryCustom, locale) ||
              m.newsFallback;
            const coverSrc = resolveNewsCoverSrc(article.cover, index);
            const title = truncateNewsCardText(
              article.title.trim(),
              NEWS_LISTING_HERO_TITLE_MAX,
            );
            const excerpt = truncateNewsCardText(
              article.excerpt.trim(),
              NEWS_LISTING_HERO_EXCERPT_MAX,
            );

            return (
              <div key={article.id} className="swiper-slide">
                <article className="igm-news-listing-hero-slide igm-news-article-hero">
                  <img
                    src={coverSrc}
                    alt=""
                    className="igm-news-listing-hero-slide-image"
                    loading={index === 0 ? "eager" : "lazy"}
                    decoding="async"
                  />
                  <div className="igm-news-article-hero-overlay" aria-hidden />
                  <div className="igm-news-article-hero-inner">
                    <div className="igm-news-article-hero-content">
                      <div className="igm-news-article-badges">
                        {category ? (
                          <span className="igm-news-article-badge igm-news-article-badge-solid">
                            {category}
                          </span>
                        ) : null}
                        <span className="igm-news-article-badge igm-news-article-badge-outline">
                          {sectionLabel}
                        </span>
                        <time
                          className="igm-news-article-hero-date"
                          dateTime={article.publishedAt}
                        >
                          {formatNewsDate(article.publishedAt, locale)}
                        </time>
                      </div>
                      <h2 className="igm-news-article-hero-title">
                        <Link href={href}>{title}</Link>
                      </h2>
                      {excerpt ? (
                        <p className="igm-news-article-hero-lead">{excerpt}</p>
                      ) : null}
                    </div>
                  </div>
                </article>
              </div>
            );
          })}
        </div>

        {articles.length > 1 ? (
          <>
            <button
              type="button"
              className="igm-news-listing-hero-prev"
              aria-label="Previous slide"
            >
              <ChevronLeft size={22} strokeWidth={2.25} aria-hidden />
            </button>
            <button type="button" className="igm-news-listing-hero-next" aria-label="Next slide">
              <ChevronRight size={22} strokeWidth={2.25} aria-hidden />
            </button>
            <div className="swiper-pagination igm-news-listing-hero-pagination" />
          </>
        ) : null}
      </div>
    </section>
  );
}
