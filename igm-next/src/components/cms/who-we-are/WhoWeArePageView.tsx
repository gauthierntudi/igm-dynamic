import type { SupportedLocale } from "@/i18n/locales";
import type { WhoWeAreSectionId } from "@/i18n/paths";
import type { CmsWhoWeAre } from "@/lib/cms/who-we-are/types";
import { resolveWhoWeArePage } from "@/lib/cms/who-we-are/resolveWhoWeArePage";

import { AboutBreadcrumbHero } from "./AboutBreadcrumbHero";
import { AboutHistoryTimeline } from "./AboutHistoryTimeline";
import { WhoWeAreScrollOnMount } from "./WhoWeAreScrollOnMount";
import { HeaderHeroDarkBody } from "@/components/cms/HeaderHeroDarkBody";

import "./about-page.css";

type Props = {
  locale: SupportedLocale;
  activeSection?: WhoWeAreSectionId | null;
  content?: CmsWhoWeAre | null;
};

export function WhoWeArePageView({ locale, activeSection = null, content = null }: Props) {
  const page = resolveWhoWeArePage(content, locale);

  return (
    <main className="igm-about-page" data-igm-page="who-we-are">
      <HeaderHeroDarkBody />

      <WhoWeAreScrollOnMount sectionId={activeSection} />

      <AboutBreadcrumbHero
        locale={locale}
        title={page.heroTitle}
        subtitle={content?.headline?.trim() || undefined}
        heroImageSrc={page.heroImageSrc}
      />

      {/* Vision — contenu institutionnel */}
      <section id="igm-wwa-about" className="about-vision">
        <div className="about-wrap">
          {page.about.title ? (
            <h2 className="about-section-title">
              {page.about.title}
              <span className="about-section-title__line" aria-hidden />
            </h2>
          ) : null}

          {page.intro ? <p className="about-vision-lead">{page.intro}</p> : null}

          <div className="about-vision-body">
            {page.about.paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 48)}>{paragraph}</p>
            ))}
          </div>

          {page.about.quote ? (
            <figure className="about-signature">
              <blockquote>
                <p>« {page.about.quote.text} »</p>
              </blockquote>
              <figcaption>
                {page.about.quote.authorPhotoSrc ? (
                  <img
                    src={page.about.quote.authorPhotoSrc}
                    alt={page.about.quote.authorPhotoAlt}
                    loading="lazy"
                    decoding="async"
                  />
                ) : null}
                <div>
                  <cite>{page.about.quote.authorName}</cite>
                  <span>{page.about.quote.authorRole}</span>
                </div>
              </figcaption>
            </figure>
          ) : null}
        </div>
      </section>

      {/* Approche / Mission — split image + panneau sombre */}
      <section id="igm-wwa-mission" className="about-approach">
        <figure className="about-approach-media">
          <img
            src={page.about.imageSrc}
            alt={page.about.imageAlt}
            loading="lazy"
            decoding="async"
          />
        </figure>

        <div className="about-approach-panel">
          <div className="about-approach-panel__inner">
            {page.mission.title ? (
              <h2 className="about-approach-title">{page.mission.title}</h2>
            ) : null}
            {page.mission.lead ? (
              <p className="about-approach-lead">{page.mission.lead}</p>
            ) : null}
            {page.mission.headline ? (
              <p className="about-approach-tagline">{page.mission.headline}</p>
            ) : null}
            {page.mission.paragraphs.length > 0 ? (
              <div className="about-approach-body">
                {page.mission.paragraphs.map((paragraph) => (
                  <p key={paragraph.slice(0, 48)} className="about-approach-text">
                    {paragraph}
                  </p>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <AboutHistoryTimeline
        locale={locale}
        sectionTitle={page.history.title ?? page.nav.history}
        introLead={page.history.introLead}
        introParagraphs={page.history.introParagraphs ?? []}
        events={page.history.milestones ?? []}
      />
    </main>
  );
}
