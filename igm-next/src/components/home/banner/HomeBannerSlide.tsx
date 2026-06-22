"use client";

import type { SupportedLocale } from "@/i18n/locales";
import type { CmsHomeBannerSlide } from "@/lib/cms/home/types";
import { resolveBannerCtaHref } from "@/lib/cms/resolveCtaLink";

import { HomeBannerCta } from "./HomeBannerCta";
import { resolveBannerImageSrc, resolveBannerVideoSrc } from "./resolveBannerMedia";

type Props = {
  slide: CmsHomeBannerSlide;
  index: number;
  locale: SupportedLocale;
};

export function HomeBannerSlide({ slide, index, locale }: Props) {
  const badge = slide.badge?.trim();
  const features =
    slide.features?.filter((feature) => feature.label?.trim()) ?? [];

  const primaryHref = slide.primaryCta?.label?.trim()
    ? resolveBannerCtaHref(slide.primaryCta, locale)
    : null;
  const secondaryHref = slide.secondaryCta?.label?.trim()
    ? resolveBannerCtaHref(slide.secondaryCta, locale)
    : null;

  const actions = [
    primaryHref && slide.primaryCta?.label?.trim()
      ? {
          key: "primary",
          label: slide.primaryCta.label.trim(),
          href: primaryHref,
          variant: "black-bg" as const,
        }
      : null,
    secondaryHref && slide.secondaryCta?.label?.trim()
      ? {
          key: "secondary",
          label: slide.secondaryCta.label.trim(),
          href: secondaryHref,
          variant: "transparent" as const,
        }
      : null,
  ].filter(Boolean);

  const content = (
    <div className="home4-banner-slide-content">
      {badge ? (
        <div className="home4-banner-badge">
          <span className="dot" />
          <span>{badge}</span>
        </div>
      ) : null}
      <h1>{slide.title.trim()}</h1>
      {slide.lead?.trim() ? <p>{slide.lead.trim()}</p> : null}
      {features.length > 0 ? (
        <div className="home4-banner-features">
          {features.map((feature, featureIndex) => (
            <div className="item" key={feature.id ?? `${index}-feature-${featureIndex}`}>
              <i className="bi bi-check-circle-fill" />
              <span>{feature.label!.trim()}</span>
            </div>
          ))}
        </div>
      ) : null}
      {actions.length > 0 ? (
        <div className={`home4-banner-actions${index === 0 ? " mt-20" : ""}`}>
          {actions.map((action) =>
            action ? (
              <HomeBannerCta
                key={action.key}
                label={action.label}
                href={action.href}
                variant={action.variant}
                locale={locale}
              />
            ) : null,
          )}
        </div>
      ) : null}
    </div>
  );

  if (slide.slideType === "video") {
    const poster = resolveBannerImageSrc(slide.image, index);
    const videoSrc = resolveBannerVideoSrc(slide.video);

    return (
      <div className="swiper-slide home4-banner-image-slide" data-type="slide-image-cover">
        <div
          className="home4-banner-slide-image"
          style={{ position: "relative", overflow: "hidden" }}
        >
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            poster={poster}
            src={videoSrc}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              zIndex: -1,
            }}
          />
          <div className="container position-relative">{content}</div>
        </div>
      </div>
    );
  }

  const backgroundImage = resolveBannerImageSrc(slide.image, index);

  return (
    <div className="swiper-slide home4-banner-image-slide" data-type="slide-image-cover">
      <div
        className="home4-banner-slide-image"
        style={{ backgroundImage: `url('${backgroundImage}')` }}
      >
        <div className="container position-relative">{content}</div>
      </div>
    </div>
  );
}
