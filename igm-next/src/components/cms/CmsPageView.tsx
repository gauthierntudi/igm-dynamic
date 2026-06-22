import Link from "next/link";

import type { CmsPage } from "@/lib/cms/types";
import { mediaUrl } from "@/lib/cdnUrl";
import { getMessages } from "@/i18n/messages";
import type { SupportedLocale } from "@/i18n/locales";
import { hrefForRoute, localizeHref } from "@/i18n/paths";

type Props = {
  page: CmsPage;
  locale: SupportedLocale;
};

function resolveHeroMedia(page: CmsPage): string {
  const media = page.hero?.media;
  if (!media || typeof media === "string" || typeof media === "number") return "";
  return mediaUrl(media);
}

export function CmsPageView({ page, locale }: Props) {
  const m = getMessages(locale).cms;
  const heroTitle = page.hero?.title?.trim() || page.title;
  const heroEyebrow = page.hero?.eyebrow?.trim();
  const heroLead = page.hero?.lead?.trim();
  const heroImage = resolveHeroMedia(page);
  const ctaLabel = page.hero?.ctaLabel?.trim();
  const ctaHref = page.hero?.ctaHref?.trim();
  const summary = page.summary?.trim();
  const contentHtml = page.contentHtml?.trim();
  const homeHref = hrefForRoute("home", locale);

  return (
    <main className="igm-cms-page" data-igm-page="cms">
      <section
        className="igm-cms-hero"
        style={heroImage ? { backgroundImage: `url(${heroImage})` } : undefined}
      >
        <div className="igm-cms-hero-overlay" />
        <div className="container">
          <nav className="igm-cms-breadcrumb" aria-label={m.breadcrumbLabel}>
            <Link href={homeHref}>{m.breadcrumbHome}</Link>
            <span aria-hidden="true">/</span>
            <span>{page.title}</span>
          </nav>
          {heroEyebrow ? <p className="igm-cms-hero-eyebrow">{heroEyebrow}</p> : null}
          <h1 className="igm-cms-hero-title">{heroTitle}</h1>
          {heroLead ? <p className="igm-cms-hero-lead">{heroLead}</p> : null}
          {ctaLabel && ctaHref ? (
            <a className="igm-cms-hero-cta" href={localizeHref(ctaHref, locale)}>
              {ctaLabel}
            </a>
          ) : null}
        </div>
      </section>

      <section className="igm-cms-body">
        <div className="container">
          {summary ? <p className="igm-cms-summary">{summary}</p> : null}
          {contentHtml ? (
            <div className="igm-cms-prose" dangerouslySetInnerHTML={{ __html: contentHtml }} />
          ) : (
            <p className="igm-cms-empty">{m.emptyContent}</p>
          )}
        </div>
      </section>
    </main>
  );
}
