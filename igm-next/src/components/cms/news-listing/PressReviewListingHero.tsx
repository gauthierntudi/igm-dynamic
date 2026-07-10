import { HeaderHeroDarkBody } from "@/components/cms/HeaderHeroDarkBody";
import { resolveNewsCoverSrc } from "@/components/home/news/resolveNewsMedia";
import type { CmsNews } from "@/lib/cms/types";

type Props = {
  title: string;
  lead: string;
  sectionLabel: string;
  eyebrow: string;
  featuredArticle?: CmsNews | null;
};

export function PressReviewListingHero({
  title,
  lead,
  sectionLabel,
  eyebrow,
  featuredArticle,
}: Props) {
  const coverSrc = resolveNewsCoverSrc(featuredArticle?.cover, 0);

  return (
    <section className="igm-press-review-listing-hero" aria-label={sectionLabel}>
      <HeaderHeroDarkBody />

      <article className="igm-press-review-listing-hero-banner igm-news-article-hero">
        <img
          src={coverSrc}
          alt=""
          className="igm-press-review-listing-hero-image"
          loading="eager"
          decoding="async"
        />
        <div className="igm-news-article-hero-overlay" aria-hidden />
        <div className="igm-news-article-hero-inner">
          <div className="igm-news-article-hero-content">
            <p className="igm-press-review-listing-hero-eyebrow">{eyebrow}</p>
            <div className="igm-news-article-badges">
              <span className="igm-news-article-badge igm-news-article-badge-solid">
                {sectionLabel}
              </span>
              <span className="igm-news-article-badge igm-news-article-badge-outline">IGM</span>
            </div>
            <h1 className="igm-news-article-hero-title">{title}</h1>
            <p className="igm-news-article-hero-lead">{lead}</p>
          </div>
        </div>
      </article>
    </section>
  );
}
