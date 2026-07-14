import Link from "next/link";

import { AboutHeroBackgroundSlideshow } from "@/components/cms/who-we-are/AboutHeroBackgroundSlideshow";
import type { SupportedLocale } from "@/i18n/locales";
import { getMessages } from "@/i18n/messages";
import { hrefForRoute } from "@/i18n/paths";

type Props = {
  locale: SupportedLocale;
  title: string;
  heroImageSrc: string;
  /** Si fourni, le fond alterne uniquement entre ces images (ex. covers d’albums). La bannière CMS (`heroImageSrc`) sert de repli si la liste est vide. */
  heroImageSrcs?: string[];
  tagline?: string;
  breadcrumbTitle?: string;
  subtitle?: string;
  parentBreadcrumb?: { href: string; label: string };
};

export function AboutBreadcrumbHero({
  locale,
  title,
  heroImageSrc,
  heroImageSrcs,
  tagline,
  breadcrumbTitle,
  subtitle,
  parentBreadcrumb,
}: Props) {
  const cms = getMessages(locale).cms;
  const homeHref = hrefForRoute("home", locale);
  const defaultTagline =
    locale === "en"
      ? "General Inspectorate of Mines — DRC"
      : "Inspection Générale des Mines — RDC";

  // Si des images de carrousel sont fournies (ex. covers d’albums), on n’y ajoute pas
  // la bannière CMS — elle sert uniquement de repli quand il n’y a pas assez de slides.
  const coverSlideshow = [
    ...new Set((heroImageSrcs ?? []).map((src) => src.trim()).filter(Boolean)),
  ];
  const slideshowImages =
    coverSlideshow.length > 0
      ? coverSlideshow
      : heroImageSrc.trim()
        ? [heroImageSrc.trim()]
        : [];
  const useSlideshow = slideshowImages.length > 1;
  const singleHeroSrc = slideshowImages[0] ?? heroImageSrc.trim();
  const heroBackground =
    !useSlideshow && singleHeroSrc
      ? { backgroundImage: `url(${JSON.stringify(singleHeroSrc)})` }
      : undefined;

  return (
    <>
      <section className="about-hero" style={heroBackground}>
        {useSlideshow ? <AboutHeroBackgroundSlideshow images={slideshowImages} /> : null}
        <div className="about-hero__overlay" aria-hidden />
        <div className="about-wrap about-hero__inner">
          <h1 className="about-hero__title">{title}</h1>
          {subtitle ? <p className="about-hero__subtitle">{subtitle}</p> : null}
        </div>
      </section>

      <div className="about-crumb-bar">
        <div className="about-wrap about-crumb-bar__inner">
          <nav className="about-crumb-bar__nav" aria-label={cms.breadcrumbLabel}>
            <Link href={homeHref}>{cms.breadcrumbHome}</Link>
            {parentBreadcrumb ? (
              <>
                <span aria-hidden="true">&gt;</span>
                <Link href={parentBreadcrumb.href}>{parentBreadcrumb.label}</Link>
              </>
            ) : null}
            <span aria-hidden="true">&gt;</span>
            <span className="about-crumb-bar__current">{breadcrumbTitle ?? title}</span>
          </nav>
          <p className="about-crumb-bar__tag">{tagline ?? defaultTagline}</p>
        </div>
      </div>
    </>
  );
}
