import Link from "next/link";

import { HeaderHeroDarkBody } from "@/components/cms/HeaderHeroDarkBody";
import { AboutBreadcrumbHero } from "@/components/cms/who-we-are/AboutBreadcrumbHero";
import type { RouteKey } from "@/i18n/paths";
import { hrefForRoute, localizeHref } from "@/i18n/paths";
import type { SupportedLocale } from "@/i18n/locales";
import { isLcfcmCmsPageRoute } from "@/lib/page-heroes/constants";
import { htmlToHistoryBlocks, splitHistoryContentFromHtml } from "@/lib/cms/parsePageHtmlToHistory";
import type { HistoryBlock } from "@/lib/cms/who-we-are/parseHistoryContent";
import type { CmsPage } from "@/lib/cms/types";
import { resolveHeroMediaSrc, tryResolveHeroMediaSrc } from "@/lib/cms/resolveHeroMediaSrc";
import { HistoryContent } from "@/lib/cms/who-we-are/parseHistoryContent";

import "@/components/cms/who-we-are/about-page.css";

type Props = {
  page: CmsPage;
  locale: SupportedLocale;
  routeKey?: RouteKey | null;
  heroImageSrc?: string;
  ctaHeroImageSrc?: string;
};

export function CmsHistoryPageView({ page, locale, routeKey, heroImageSrc, ctaHeroImageSrc }: Props) {
  const isEn = locale === "en";
  const isLcfcmPage = isLcfcmCmsPageRoute(routeKey);
  const resolvedHeroImageSrc =
    heroImageSrc ??
    resolveHeroMediaSrc(
      page.hero?.media && typeof page.hero.media === "object" ? page.hero.media : null,
      "/assets/img/img-07.jpg",
    );
  const resolvedCtaHeroImageSrc =
    ctaHeroImageSrc ??
    tryResolveHeroMediaSrc(
      page.hero?.ctaMedia && typeof page.hero.ctaMedia === "object" ? page.hero.ctaMedia : null,
    ) ??
    resolvedHeroImageSrc;
  const heroTitle = page.hero?.title?.trim() || page.title;
  const asideLabel = page.hero?.eyebrow?.trim() || page.title;
  const breadcrumbTitle = page.title;
  const heroLead = page.hero?.lead?.trim();

  const { bodyBlocks, closingText } = page.contentHtml?.trim()
    ? splitHistoryContentFromHtml(page.contentHtml)
    : page.summary?.trim()
      ? { bodyBlocks: [{ type: "paragraph", text: page.summary.trim() } satisfies HistoryBlock], closingText: "" }
      : { bodyBlocks: [], closingText: "" };

  const contentBlocks =
    isLcfcmPage && closingText
      ? [...bodyBlocks, { type: "paragraph", text: closingText } satisfies HistoryBlock]
      : bodyBlocks;

  const showClosingCta = !isLcfcmPage && Boolean(closingText);

  const ctaHref = page.hero?.ctaHref?.trim()
    ? localizeHref(page.hero.ctaHref, locale)
    : hrefForRoute("about", locale);
  const ctaLabel =
    page.hero?.ctaLabel?.trim() ||
    (isEn ? "About us" : "À propos de nous");

  const ctaTitle = isEn
    ? "A central actor in mining governance"
    : "Un acteur central de la gouvernance minière";

  return (
    <main className="igm-about-page" data-igm-page="cms-history" data-lcfcm-page={isLcfcmPage ? "true" : undefined}>
      <HeaderHeroDarkBody />

      <AboutBreadcrumbHero
        locale={locale}
        title={heroTitle}
        breadcrumbTitle={breadcrumbTitle}
        heroImageSrc={resolvedHeroImageSrc}
        subtitle={heroLead}
      />

      <section className="about-history-full">
        <div className="about-wrap about-history-layout">
          <aside className="about-history-layout__aside" aria-label={asideLabel}>
            <h2
              className={
                isLcfcmPage
                  ? "about-history-teaser__title about-history-teaser__title--lcfcm"
                  : "about-history-teaser__title"
              }
            >
              {asideLabel}
            </h2>
            <span className="about-history-teaser__line" aria-hidden />
          </aside>

          <article className="about-history-layout__main">
            {!isLcfcmPage ? (
              <header className="about-history-doc-head">
                <h1 className="about-history-doc-title">{page.title}</h1>
              </header>
            ) : null}

            {contentBlocks.length > 0 ? <HistoryContent blocks={contentBlocks} /> : null}
          </article>
        </div>
      </section>

      {showClosingCta ? (
        <section
          className="about-history-cta"
          style={{ backgroundImage: `url(${resolvedCtaHeroImageSrc})` }}
          aria-label={ctaLabel}
        >
          <div className="about-history-cta__overlay" aria-hidden />
          <div className="about-wrap about-history-cta__inner">
            <div className="about-history-cta__content">
              <h2 className="about-history-cta__title">{ctaTitle}</h2>
              <p className="about-history-cta__text">{closingText.replace(/^•\s*/, "")}</p>
            </div>
            <Link href={ctaHref} className="about-history-cta__btn">
              {ctaLabel}
            </Link>
          </div>
        </section>
      ) : null}
    </main>
  );
}
