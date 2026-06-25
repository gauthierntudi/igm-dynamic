import { mediaUrl } from "@/lib/cdnUrl";
import { resolveBannerCtaHref } from "@/lib/cms/resolveCtaLink";
import { getMessages } from "@/i18n/messages";
import { resolveNewsCategoryLabel } from "@/lib/newsCategories";
import {
  NEWS_CARD_EXCERPT_MAX_LENGTH,
  NEWS_CARD_TITLE_MAX_LENGTH,
  truncateNewsCardText,
} from "@/lib/newsDisplay";
import { DEFAULT_LOCALE, type SupportedLocale } from "@/i18n/locales";
import { hrefForRoute, localizeHref } from "@/i18n/paths";

import type { CmsMedia } from "../types";
import type {
  CmsHome,
  CmsHomeBannerSlide,
  CmsHomeAbout,
  CmsHomeStrategy,
  CmsHomeStatsSection,
  CmsHomeNewsSection,
  CmsHomeCta,
  HomeRenderContext,
} from "./types";
import type { CmsNews } from "../types";

const BTN_ARROW_SVG = `<svg width="10" height="10" viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg"><path d="M1 9L9 1M9 1C7.22222 1.33333 3.33333 2 1 1M9 1C8.66667 2.66667 8 6.33333 9 9" stroke-width="1.5" stroke-linecap="round"></path></svg>`;

const AXIS_CHECK_SVG = `<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M5.65353 11.6968L7.56353 14.463C8.74893 12.7506 14.0179 4.386 17.0475 0.5C13.9099 6.4268 11.1823 12.6098 8.72913 18.823C8.37712 19.7142 7.12192 19.7294 6.75232 18.8454C5.58372 16.0514 4.32732 13.2748 2.95312 10.577C3.94112 10.3794 4.99472 10.7088 5.65332 11.6968H5.65353Z"></path></svg>`;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function resolveMediaSrc(media: CmsMedia | number | null | undefined, fallback: string): string {
  if (!media || typeof media === "number") return fallback;
  return mediaUrl(media) || fallback;
}

function renderCta(
  cta: CmsHomeCta | null | undefined,
  variant: "black-bg" | "transparent",
  locale: SupportedLocale,
): string {
  if (!cta?.label?.trim()) return "";
  const rawHref = resolveBannerCtaHref(cta, locale);
  const href = escapeHtml(rawHref);
  const reportHref = hrefForRoute("report", locale);
  const signalementAttr =
    rawHref.includes("/denoncer") || rawHref === reportHref ? ' data-igm-open-signalement' : "";
  const label = escapeHtml(cta.label.trim());
  return `<a class="primary-btn4 ${variant}" href="${href}"${signalementAttr}><span class="icon">${BTN_ARROW_SVG}</span><span class="content">${label}</span><span class="icon two">${BTN_ARROW_SVG}</span></a>`;
}

function renderBannerFeatures(features: CmsHomeBannerSlide["features"]): string {
  if (!features?.length) return "";
  const items = features
    .filter((f) => f.label?.trim())
    .map(
      (f) =>
        `<div class="item"><i class="bi bi-check-circle-fill"></i><span>${escapeHtml(f.label!.trim())}</span></div>`,
    )
    .join("");
  if (!items) return "";
  return `<div class="home4-banner-features">${items}</div>`;
}

function renderBannerSlide(slide: CmsHomeBannerSlide, index: number, locale: SupportedLocale): string {
  const badge = slide.badge?.trim();
  const title = escapeHtml(slide.title.trim());
  const lead = slide.lead?.trim() ? `<p>${escapeHtml(slide.lead.trim())}</p>` : "";
  const features = renderBannerFeatures(slide.features);
  const actions = [
    renderCta(slide.primaryCta, "black-bg", locale),
    renderCta(slide.secondaryCta, "transparent", locale),
  ]
    .filter(Boolean)
    .join("");
  const actionsHtml = actions
    ? `<div class="home4-banner-actions${index === 0 ? " mt-20" : ""}">${actions}</div>`
    : "";

  const badgeHtml = badge
    ? `<div class="home4-banner-badge"><span class="dot"></span><span>${escapeHtml(badge)}</span></div>`
    : "";

  const content = `<div class="home4-banner-slide-content">${badgeHtml}<h1>${title}</h1>${lead}${features}${actionsHtml}</div>`;

  if (slide.slideType === "video") {
    const poster = resolveMediaSrc(slide.image, "assets/img/slides/2.jpg");
    const videoSrc = resolveMediaSrc(slide.video, "assets/video/mining.mp4");
    return `<div class="swiper-slide home4-banner-image-slide" data-type="slide-image-cover">
        <div class="home4-banner-slide-image" style="position: relative; overflow: hidden;">
          <video autoplay loop muted playsinline preload="metadata" poster="${escapeHtml(poster)}" src="${escapeHtml(videoSrc)}" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; z-index: -1;"></video>
          <div class="container position-relative">${content}</div>
        </div>
      </div>`;
  }

  const bg = resolveMediaSrc(slide.image, `assets/img/slides/${(index % 5) + 1}.jpg`);
  return `<div class="swiper-slide home4-banner-image-slide" data-type="slide-image-cover">
        <div class="home4-banner-slide-image" style="background-image: url('${escapeHtml(bg)}')">
          <div class="container position-relative">${content}</div>
        </div>
      </div>`;
}

export function renderBannerSlides(
  slides: CmsHomeBannerSlide[] | null | undefined,
  locale: SupportedLocale = DEFAULT_LOCALE,
): string | null {
  if (!slides?.length) return null;
  const valid = slides.filter((s) => s.title?.trim());
  if (!valid.length) return null;
  return valid.map((slide, i) => renderBannerSlide(slide, i, locale)).join("\n");
}

function renderMissionVisionCard(
  data: { title?: string | null; text?: string | null; href?: string | null } | null | undefined,
  icon: string,
  locale: SupportedLocale,
): string {
  if (!data?.title?.trim()) return "";
  const href = escapeHtml(localizeHref(data.href?.trim() || "#", locale));
  const text = data.text?.trim() ? `<p>${escapeHtml(data.text.trim())}</p>` : "";
  return `<div class="swiper-slide">
                        <a href="${href}" class="mission-vision-link mt-30">
                          <div class="icon"><i class="bi bi-${icon}"></i></div>
                          <h5>${escapeHtml(data.title.trim())}</h5>
                          ${text}
                        </a>
                      </div>`;
}

export function renderAboutSection(
  about: CmsHomeAbout | null | undefined,
  locale: SupportedLocale = DEFAULT_LOCALE,
): string | null {
  if (!about?.title?.trim()) return null;

  const imageSrc = resolveMediaSrc(about.image, "assets/img/img-07.jpg");
  const signatureName = about.signatureName?.trim();
  const signatureRole = about.signatureRole?.trim();
  const signature =
    signatureName && signatureRole
      ? `<div class="signature d-lg-block d-none"><h3>${escapeHtml(signatureName)}</h3><span>${escapeHtml(signatureRole)}</span></div>`
      : "";
  const signatureMobile =
    signatureName && signatureRole
      ? `<div class="signature signature-mobile-overlay d-lg-none d-block"><h3>${escapeHtml(signatureName)}</h3><span>${escapeHtml(signatureRole)}</span></div>`
      : "";

  const mission = renderMissionVisionCard(about.mission, "globe", locale);
  const vision = renderMissionVisionCard(about.vision, "eye", locale);
  const slides = [mission, vision].filter(Boolean).join("\n");

  const lead = about.leadText?.trim()
    ? `<p class="lead-text">${escapeHtml(about.leadText.trim())}</p>`
    : "";
  const detail = about.detailText?.trim()
    ? `<p class="detail-text">${escapeHtml(about.detailText.trim()).replace(/\n/g, "<br>")}</p>`
    : "";

  return `<div class="home4-about-section mb-130 mt-100">
    <div class="container">
      <div class="row align-items-center">
        <div class="col-lg-7 wow animate fadeInLeft" data-wow-delay="200ms" data-wow-duration="1500ms">
          <div class="about-content">
            <h1>${escapeHtml(about.title.trim())}</h1>
            <div class="row">
              <div class="col-md-4">
                <div class="mission-side mt-20">
                  <div class="swiper mission-vision-slider">
                    <div class="swiper-wrapper">
                      ${slides}
                    </div>
                    <div class="mission-pagination dots"></div>
                  </div>
                </div>
              </div>
              <div class="col-md-8">
                <div class="main-text">
                  ${lead}
                  ${detail}
                  ${signature}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-lg-5 wow animate fadeInRight" data-wow-delay="400ms" data-wow-duration="1500ms">
          <div class="about-image-block">
            <div class="image-wrapper" style="position: relative;">
              <img src="${escapeHtml(imageSrc)}" alt="IGM">
              <div class="decor-box"></div>
              ${signatureMobile}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>`;
}

export function renderStrategySection(
  strategy: CmsHomeStrategy | null | undefined,
  locale: SupportedLocale = DEFAULT_LOCALE,
): string | null {
  if (!strategy?.title?.trim()) return null;

  const axes =
    strategy.axes
      ?.filter((a) => a.highlight?.trim() || a.text?.trim())
      .map((axis) => {
        const highlight = axis.highlight?.trim()
          ? `<strong>${escapeHtml(axis.highlight.trim())}</strong>`
          : "";
        const text = axis.text?.trim() ? escapeHtml(axis.text.trim()) : "";
        return `<li>${AXIS_CHECK_SVG}<span style="font-family: 'Google Sans', sans-serif !important;">${highlight}${text ? ` ${text}` : ""}</span></li>`;
      })
      .join("") ?? "";

  const counterLabel = strategy.counterLabel?.trim() || "Provinces de <br /> présence.";
  const ctaLabel = strategy.ctaLabel?.trim();
  const ctaHref = escapeHtml(localizeHref(strategy.ctaHref?.trim() || "/contact", locale));
  const cta = ctaLabel
    ? `<a class="primary-btn5" href="${ctaHref}" style="font-family: 'Google Sans', sans-serif !important;">${escapeHtml(ctaLabel)}${BTN_ARROW_SVG}</a>`
    : "";

  const lead = strategy.lead?.trim()
    ? `<p style="font-family: 'Google Sans', sans-serif !important;">${escapeHtml(strategy.lead.trim())}</p>`
    : "";
  const axesTitle = strategy.axesTitle?.trim()
    ? `<h5 style="font-family: 'Google Sans', sans-serif !important; font-weight: 700;">${escapeHtml(strategy.axesTitle.trim())}</h5>`
    : "";

  return `<div class="home5-about-section home4-services-section mb-0">
  <div class="video-area">
    <video autoplay="" loop="" muted="" playsinline="" src="assets/video/mining.mp4"></video>
  </div>
  <div class="about-wrapper about-wrapper-bg">
    <img src="assets/img/home5/home5-about-section-vector1.svg" alt="" class="vector1" />
    <div class="container">
      <div class="row gy-md-4 gy-5">
        <div class="col-xl-4 col-lg-5 col-md-6 wow animate fadeInLeft" data-wow-delay="200ms" data-wow-duration="1500ms">
          <div class="section-title four white">
            <h2 style="font-family: 'Google Sans', sans-serif !important; font-weight: 700;">${escapeHtml(strategy.title.trim())}</h2>
            ${lead}
          </div>
        </div>
        <div class="col-xxl-5 col-xl-4 col-lg-5 col-md-6 d-flex justify-content-md-center wow animate fadeInUp" data-wow-delay="400ms" data-wow-duration="1500ms">
          <div class="benefit-area">
            ${axesTitle}
            <ul>${axes}</ul>
          </div>
        </div>
        <div class="col-xxl-3 col-lg-4 wow animate fadeInRight" data-wow-delay="200ms" data-wow-duration="1500ms">
          <div class="counter-and-btn-area">
            <div class="counter-area">
              <div class="number">
                <h2 class="counter" data-stat-key="provinces-presence" data-target="22">0</h2>
                <span></span>
              </div>
              <span style="font-family: 'Google Sans', sans-serif !important;">${counterLabel}</span>
            </div>
            ${cta}
          </div>
        </div>
      </div>
    </div>
  </div>
</div>`;
}

export function renderStatsHeader(statsSection: CmsHomeStatsSection | null | undefined): string | null {
  if (!statsSection?.title?.trim()) return null;
  const lead = statsSection.lead?.trim()
    ? `<p style="font-family: 'Google Sans', sans-serif !important; max-width: 800px; margin: 0 auto;">${escapeHtml(statsSection.lead.trim())}</p>`
    : "";
  return `<div class="section-title four mb-60 text-center wow animate fadeInUp">
        <h2 style="font-family: 'Google Sans', sans-serif !important; font-weight: 700;">${escapeHtml(statsSection.title.trim())}</h2>
        ${lead}
      </div>`;
}

function formatNewsDate(iso: string, locale: SupportedLocale): string {
  try {
    return new Date(iso).toLocaleDateString(locale === "en" ? "en-GB" : "fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

function renderNewsCard(item: CmsNews, locale: SupportedLocale): string {
  const cover =
    item.cover && typeof item.cover === "object" ? mediaUrl(item.cover) : "";
  const imgSrc = cover || "assets/img/img-06.jpg";
  const newsBase = localizeHref("/actualites", locale);
  const href = escapeHtml(`${newsBase}/${item.slug}`);
  const categoryLabel = resolveNewsCategoryLabel(
    item.category,
    item.categoryCustom,
    locale,
  );
  const category = categoryLabel
    ? escapeHtml(categoryLabel)
    : escapeHtml(getMessages(locale).common.newsFallback);
  const date = formatNewsDate(item.publishedAt, locale);
  const title = escapeHtml(
    truncateNewsCardText(item.title.trim(), NEWS_CARD_TITLE_MAX_LENGTH),
  );
  const excerpt = escapeHtml(
    truncateNewsCardText(item.excerpt.trim(), NEWS_CARD_EXCERPT_MAX_LENGTH),
  );
  const readMore = escapeHtml(getMessages(locale).common.readMore);

  return `<div class="swiper-slide">
        <div class="menu-blog-card igm-news-card">
          <a class="blog-img" href="${href}"><img src="${escapeHtml(imgSrc)}" alt="${title}" /></a>
          <div class="blog-content">
            <ul class="blog-meta">
              <li><a href="${href}">${category}</a></li>
              <li class="blog-date"><a href="${href}">${escapeHtml(date)}</a></li>
            </ul>
            <h5><a href="${href}">${title}</a></h5>
            <p class="igm-news-excerpt">${excerpt}</p>
            <a class="read-more-btn" href="${href}">${readMore}${BTN_ARROW_SVG}</a>
          </div>
        </div>
      </div>`;
}

export function renderNewsSection(
  section: CmsHomeNewsSection | null | undefined,
  news: CmsNews[],
  locale: SupportedLocale = DEFAULT_LOCALE,
): string | null {
  if (!section?.title?.trim()) return null;

  const titleParts = section.title.trim().split(/\s+/);
  const titleHtml =
    titleParts.length > 1
      ? `<strong>${escapeHtml(titleParts[0])}</strong> ${escapeHtml(titleParts.slice(1).join(" "))}`
      : `<strong>${escapeHtml(section.title.trim())}</strong>`;

  const lead = section.lead?.trim()
    ? `<p>${escapeHtml(section.lead.trim())}</p>`
    : "";

  const slides = news.length ? news.map((item) => renderNewsCard(item, locale)).join("\n") : "";

  return `<div class="home4-news-section mb-130">
  <div class="container">
    <div class="row mb-50">
      <div class="col-lg-12">
        <div class="section-title2">
          <h2>${titleHtml}</h2>
          ${lead}
        </div>
      </div>
    </div>
    <div class="row justify-content-center">
      <div class="col-12">
        <div class="swiper igm-news-slider">
          <div class="swiper-wrapper">
            ${slides}
          </div>
          <div class="swiper-pagination igm-news-pagination"></div>
        </div>
      </div>
    </div>
  </div>
</div>`;
}

export function buildHomeSections(ctx: HomeRenderContext): Record<string, string | null> {
  const { home } = ctx;

  return {
    "home-stats-header": renderStatsHeader(home.statsSection),
  };
}
