import Link from "next/link";
import { ArrowRight } from "lucide-react";

import type { SupportedLocale } from "@/i18n/locales";
import { getMessages } from "@/i18n/messages";
import { hrefForRoute, type WhoWeAreSectionId } from "@/i18n/paths";
import type { CmsWhoWeAre } from "@/lib/cms/who-we-are/types";
import { resolveWhoWeArePage } from "@/lib/cms/who-we-are/resolveWhoWeArePage";

import { WhoWeAreScrollOnMount } from "./WhoWeAreScrollOnMount";
import { HistoryContent } from "@/lib/cms/who-we-are/parseHistoryContent";

type Props = {
  locale: SupportedLocale;
  activeSection?: WhoWeAreSectionId | null;
  content: CmsWhoWeAre | null;
};

const SECTION_ORDER: WhoWeAreSectionId[] = ["about", "history", "mission"];

export function WhoWeArePageView({ locale, activeSection = null, content }: Props) {
  const cms = getMessages(locale).cms;
  const page = resolveWhoWeArePage(content, locale);
  const homeHref = hrefForRoute("home", locale);
  const aboutExcerpt =
    page.about.paragraphs[0] ??
    page.about.paragraphs.slice(0, 2).join(" ") ??
    "";

  return (
    <main className="igm-about-page" data-igm-page="who-we-are">
      <WhoWeAreScrollOnMount sectionId={activeSection} />

      <div className="igm-about-page-glow igm-about-page-glow-a" aria-hidden />
      <div className="igm-about-page-glow igm-about-page-glow-b" aria-hidden />

      <section className="igm-about-page-hero">
        <div className="container igm-about-page-container">
          <nav className="igm-about-page-breadcrumb" aria-label={cms.breadcrumbLabel}>
            <Link href={homeHref}>{cms.breadcrumbHome}</Link>
            <span aria-hidden="true">/</span>
            <span>{page.nav.about}</span>
          </nav>

          <h1 className="igm-about-page-headline">{page.headline}</h1>

          <div className="igm-about-page-lead-row">
            <span className="igm-about-page-lead-line" aria-hidden />
            <p className="igm-about-page-lead">{page.intro}</p>
          </div>
        </div>
      </section>

      <nav className="igm-about-page-nav" aria-label={page.headline}>
        <div className="container igm-about-page-container">
          <ul className="igm-about-page-nav-list">
            {SECTION_ORDER.map((sectionId) => (
              <li key={sectionId}>
                <a
                  href={`#igm-wwa-${sectionId}`}
                  className={activeSection === sectionId ? "is-active" : undefined}
                >
                  {page.nav[sectionId]}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      <section id="igm-wwa-about" className="igm-about-page-section">
        <div className="container igm-about-page-container">
          <div className="igm-about-page-gallery">
            <div className="igm-about-page-gallery-col igm-about-page-gallery-col-tall">
              <img src={page.heroImageSrc} alt={page.heroImageAlt} />
            </div>

            <div className="igm-about-page-gallery-col igm-about-page-gallery-col-main">
              <img
                src={page.about.imageSrc}
                alt={page.about.imageAlt}
                className="igm-about-page-gallery-thumb"
              />
              <div className="igm-about-page-gallery-copy">
                <h2>{page.about.title}</h2>
                {aboutExcerpt ? <p>{aboutExcerpt}</p> : null}
                <a href="#igm-wwa-history" className="igm-about-page-btn">
                  {locale === "en" ? "See details" : "Voir les détails"}
                  <ArrowRight size={16} aria-hidden />
                </a>
              </div>
            </div>

            <div className="igm-about-page-gallery-col igm-about-page-gallery-col-side">
              <img src={page.contact.imageSrc} alt={page.contact.imageAlt} />
            </div>

            <a href="#igm-about-contact" className="igm-about-page-orbit" aria-label={page.contact.primaryLabel}>
              <span>{locale === "en" ? "Contact us" : "Nous contacter"}</span>
            </a>
          </div>

          {page.about.paragraphs.length > 1 || page.about.quote ? (
            <div className="igm-about-page-about-more">
              {page.about.paragraphs.length > 1 ? (
                <div className="igm-about-page-prose">
                  {page.about.paragraphs.slice(1).map((paragraph) => (
                    <p key={paragraph.slice(0, 48)}>{paragraph}</p>
                  ))}
                </div>
              ) : null}

              {page.about.quote ? (
                <div className="igm-about-page-quote-row">
                  <div className="igm-about-page-author">
                    <img
                      src={page.about.quote.authorPhotoSrc}
                      alt={page.about.quote.authorPhotoAlt}
                      className="igm-about-page-author-photo"
                    />
                    <div>
                      <strong>{page.about.quote.authorName}</strong>
                      <span>{page.about.quote.authorRole}</span>
                    </div>
                  </div>
                  <blockquote className="igm-about-page-quote">
                    <p>« {page.about.quote.text} »</p>
                  </blockquote>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </section>

      <section className="igm-about-page-highlight">
        <div className="container igm-about-page-container">
          <div className="igm-about-page-highlight-inner">
            <div className="igm-about-page-divider" />
            <div className="igm-about-page-split igm-about-page-highlight-split">
              <h2>{page.mission.headline}</h2>
              <p className="igm-about-page-highlight-text">
                {page.mission.paragraphs[0] ?? page.mission.lead}
              </p>
            </div>
            <div className="igm-about-page-divider" />
          </div>
        </div>
      </section>

      <section id="igm-wwa-history" className="igm-about-page-section igm-about-page-section-soft">
        <div className="container igm-about-page-container">
          <div className="igm-about-page-section-intro">
            <h2>{page.history.title}</h2>
            {page.history.lead ? <p>{page.history.lead}</p> : null}
          </div>
          {page.history.paragraphs.length > 0 ? (
            <HistoryContent paragraphs={page.history.paragraphs} />
          ) : null}
        </div>
      </section>

      <section id="igm-wwa-mission" className="igm-about-page-section">
        <div className="container igm-about-page-container">
          <div className="igm-about-page-section-intro">
            <h2>{page.mission.title}</h2>
            <p>{page.mission.lead}</p>
          </div>

          {page.stats.length > 0 ? (
            <div className="igm-about-page-stats">
              {page.stats.map((stat) => (
                <div key={`${stat.label}-${stat.value}`} className="igm-about-page-stat">
                  <span>{stat.label}</span>
                  <strong>{stat.value}</strong>
                </div>
              ))}
            </div>
          ) : null}

          {page.mission.paragraphs.length > 1 ? (
            <div className="igm-about-page-prose igm-about-page-mission-prose">
              {page.mission.paragraphs.slice(1).map((paragraph) => (
                <p key={paragraph.slice(0, 48)}>{paragraph}</p>
              ))}
            </div>
          ) : null}

          <div className="igm-about-page-mission-grid">
            <div className="igm-about-page-mission-card">
              <h3>{page.mission.statutoryTitle}</h3>
              <ul>
                {page.mission.statutoryItems.map((item) => (
                  <li key={item.slice(0, 48)}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="igm-about-page-mission-card igm-about-page-mission-card-accent">
              <h3>{page.mission.prioritiesTitle}</h3>
              <ul>
                {page.mission.priorities.map((item) => (
                  <li key={item.slice(0, 48)}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {page.team.members.length > 0 ? (
        <section className="igm-about-page-section igm-about-page-section-soft">
          <div className="container igm-about-page-container">
            <div className="igm-about-page-section-intro igm-about-page-section-intro-wide">
              <h2>{page.team.title}</h2>
              <p>{page.team.lead}</p>
            </div>

            <div className="igm-about-page-team-track">
              {page.team.members.map((member) => (
                <article key={member.name} className="igm-about-page-team-card">
                  <img src={member.photoSrc} alt={member.photoAlt} />
                  <div className="igm-about-page-team-meta">
                    <div>
                      <h3>{member.name}</h3>
                      <p>{member.role}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="igm-about-page-section">
        <div className="container igm-about-page-container">
          <div className="igm-about-page-split igm-about-page-join">
            <h2>{page.cta.title}</h2>
            <div>
              <p className="igm-about-page-join-text">{page.cta.text}</p>
              <Link href={page.cta.href} className="igm-about-page-text-link">
                {page.cta.label}
                <ArrowRight size={18} aria-hidden />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section id="igm-about-contact" className="igm-about-page-contact">
        <div className="container igm-about-page-container">
          <div className="igm-about-page-contact-grid">
            <div className="igm-about-page-contact-copy">
              <h2>{page.contact.title}</h2>
              <p>{page.contact.lead}</p>
              <div className="igm-about-page-contact-actions">
                <Link href={page.contact.primaryHref} className="igm-about-page-contact-btn">
                  {page.contact.primaryLabel}
                </Link>
                <a href={page.contact.phoneHref} className="igm-about-page-contact-phone">
                  {page.contact.phoneLabel}
                </a>
              </div>
            </div>
            <div className="igm-about-page-contact-media">
              <img src={page.contact.imageSrc} alt={page.contact.imageAlt} />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
