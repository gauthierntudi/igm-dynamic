import Link from "next/link";
import { ArrowRight } from "lucide-react";

import type { SupportedLocale } from "@/i18n/locales";
import { hrefForRoute, type WhoWeAreSectionId } from "@/i18n/paths";
import type { CmsWhoWeAre } from "@/lib/cms/who-we-are/types";
import { resolveWhoWeArePage } from "@/lib/cms/who-we-are/resolveWhoWeArePage";

import { AboutBreadcrumbHero } from "./AboutBreadcrumbHero";
import { WhoWeAreScrollOnMount } from "./WhoWeAreScrollOnMount";
import { HeaderHeroDarkBody } from "@/components/cms/HeaderHeroDarkBody";

import "./about-page.css";

type Props = {
  locale: SupportedLocale;
  activeSection?: WhoWeAreSectionId | null;
  content?: CmsWhoWeAre | null;
};

function stripMarkdown(text: string): string {
  return text.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
}

export function WhoWeArePageView({ locale, activeSection = null, content = null }: Props) {
  const page = resolveWhoWeArePage(content, locale);
  const historyHref = hrefForRoute("history", locale);
  const contactHref = page.contact.primaryHref;
  const isEn = locale === "en";

  const historyTeaser =
    page.history.paragraphs.slice(0, 2).map(stripMarkdown).join(" ") ||
    page.history.lead;

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
            {page.mission.paragraphs[0] ? (
              <p className="about-approach-text">{page.mission.paragraphs[0]}</p>
            ) : null}
          </div>
        </div>
      </section>

      {/* Historique — teaser vers page dédiée */}
      <section className="about-history-teaser">
        <div className="about-wrap about-history-teaser__grid">
          <div className="about-history-teaser__aside">
            <h2 className="about-history-teaser__title">{page.nav.history}</h2>
            <span className="about-history-teaser__line" aria-hidden />
          </div>

          <div className="about-history-teaser__main">
            <p className="about-history-teaser__lead">
              {page.history.lead ||
                (isEn
                  ? "Created by Decree No. 23/19, the IGM ensures transparency and compliance in the mining sector."
                  : "Créée par le Décret n°23/19, l'IGM garantit transparence et conformité dans le secteur minier.")}
            </p>
            <p className="about-history-teaser__excerpt">{historyTeaser}</p>

            <div className="about-history-teaser__gallery">
              {page.history.teaserImages.map((image) => (
                <figure key={image.src}>
                  <img
                    src={image.src}
                    alt={image.alt}
                    loading="lazy"
                    decoding="async"
                  />
                </figure>
              ))}
            </div>

            <Link href={historyHref} className="about-link-btn">
              {isEn ? "Read our full history" : "Lire l'historique complet"}
              <ArrowRight size={16} aria-hidden />
            </Link>
          </div>
        </div>
      </section>

      {/* Bandeau charte + contact */}
      <section
        className="about-accent-bar"
        aria-label={page.contact.title ?? (isEn ? "Contact" : "Contact")}
      >
        <div className="about-wrap about-accent-bar__inner">
          <p>{page.cta.text}</p>
          <Link href={contactHref} className="about-accent-bar__link">
            {page.contact.primaryLabel}
            <ArrowRight size={18} aria-hidden />
          </Link>
        </div>
      </section>
    </main>
  );
}
