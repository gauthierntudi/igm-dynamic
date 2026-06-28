import Link from "next/link";

import { HeaderHeroDarkBody } from "@/components/cms/HeaderHeroDarkBody";
import type { SupportedLocale } from "@/i18n/locales";
import { hrefForRoute } from "@/i18n/paths";
import type { CmsWhoWeAre } from "@/lib/cms/who-we-are/types";
import { HistoryContent } from "@/lib/cms/who-we-are/parseHistoryContent";
import { getHistoryHeroTitle } from "@/lib/cms/who-we-are/historyHeroTitle";
import { resolveWhoWeArePage } from "@/lib/cms/who-we-are/resolveWhoWeArePage";

import { AboutBreadcrumbHero } from "./AboutBreadcrumbHero";

import "./about-page.css";

type Props = {
  locale: SupportedLocale;
  content?: CmsWhoWeAre | null;
};

export function WhoWeAreHistoryPageView({ locale, content = null }: Props) {
  const page = resolveWhoWeArePage(content, locale);
  const isEn = locale === "en";
  const aboutHref = hrefForRoute("about", locale);
  const heroTitle = getHistoryHeroTitle(page);

  const allParagraphs = page.history.paragraphs;
  const closingText = allParagraphs.length > 1 ? (allParagraphs.at(-1) ?? "") : "";
  const bodyParagraphs =
    closingText && allParagraphs.length > 1 ? allParagraphs.slice(0, -1) : allParagraphs;

  const ctaTitle = isEn
    ? "A central actor in mining governance"
    : "Un acteur central de la gouvernance minière";

  return (
    <main className="igm-about-page" data-igm-page="who-we-are-history">
      <HeaderHeroDarkBody />

      <AboutBreadcrumbHero
        locale={locale}
        title={heroTitle}
        breadcrumbTitle={page.nav.history}
        heroImageSrc={page.history.heroImageSrc}
      />

      <section className="about-history-full">
        <div className="about-wrap about-history-layout">
          <aside className="about-history-layout__aside" aria-label={page.nav.history}>
            <h2 className="about-history-teaser__title">{page.nav.history}</h2>
            <span className="about-history-teaser__line" aria-hidden />
          </aside>

          <article className="about-history-layout__main">
            <header className="about-history-doc-head">
              <h1 className="about-history-doc-title">{page.history.title}</h1>
            </header>

            {bodyParagraphs.length > 0 ? (
              <HistoryContent paragraphs={bodyParagraphs} />
            ) : null}
          </article>
        </div>
      </section>

      {closingText ? (
        <section
          className="about-history-cta"
          style={{ backgroundImage: `url(${page.history.ctaImageSrc})` }}
          aria-label={isEn ? "About us" : "À propos de nous"}
        >
          <div className="about-history-cta__overlay" aria-hidden />
          <div className="about-wrap about-history-cta__inner">
            <div className="about-history-cta__content">
              <h2 className="about-history-cta__title">{ctaTitle}</h2>
              <p className="about-history-cta__text">{closingText}</p>
            </div>
            <Link href={aboutHref} className="about-history-cta__btn">
              {isEn ? "About us" : "À propos de nous"}
            </Link>
          </div>
        </section>
      ) : null}
    </main>
  );
}
