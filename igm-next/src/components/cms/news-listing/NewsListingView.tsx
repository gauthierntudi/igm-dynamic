import type { SupportedLocale } from "@/i18n/locales";
import {
  hrefForNewsListing,
  hrefForPressReviewListing,
} from "@/i18n/paths";
import { getMessages } from "@/i18n/messages";
import type { CmsNews } from "@/lib/cms/types";

import { NewsListingCard } from "./NewsListingCard";
import { NewsListingHeroSlider } from "./NewsListingHeroSlider";
import { NewsListingPagination } from "./NewsListingPagination";
import { PressReviewListingHero } from "./PressReviewListingHero";

export type NewsListingVariant = "news" | "pressReview";

type Props = {
  locale: SupportedLocale;
  variant?: NewsListingVariant;
  heroArticles?: CmsNews[];
  articles: CmsNews[];
  page: number;
  totalPages: number;
  totalDocs: number;
  q?: string;
};

export function NewsListingView({
  locale,
  variant = "news",
  heroArticles = [],
  articles,
  page,
  totalPages,
  totalDocs,
  q,
}: Props) {
  const isPressReview = variant === "pressReview";
  const messages = getMessages(locale);
  const m = isPressReview ? messages.pressReviewListing : messages.newsListing;
  const pressReviewM = messages.pressReviewListing;
  const listingHref = isPressReview
    ? hrefForPressReviewListing(locale)
    : hrefForNewsListing(locale);
  const showHeroSlider = !isPressReview && heroArticles.length > 0;

  return (
    <main
      className={`igm-news-listing${isPressReview ? " igm-news-listing--press-review" : ""}`}
      data-igm-page={isPressReview ? "press-review-listing" : "news-listing"}
    >
      {showHeroSlider ? (
        <NewsListingHeroSlider
          articles={heroArticles}
          locale={locale}
          sectionLabel={m.sectionLabel}
        />
      ) : null}

      {isPressReview ? (
        <PressReviewListingHero
          title={m.exploreTitle}
          lead={m.heroLead}
          sectionLabel={m.sectionLabel}
          eyebrow={m.heroEyebrow}
          featuredArticle={articles[0]}
        />
      ) : null}

      <section className="igm-news-listing-body">
        <div className="container">
          <div className="igm-news-listing-toolbar">
            {isPressReview ? (
              <h2 className="igm-news-listing-heading igm-news-listing-heading-secondary">
                {m.bodyTitle}
              </h2>
            ) : (
              <h1 className="igm-news-listing-heading">{m.exploreTitle}</h1>
            )}
            <form className="igm-news-listing-search" action={listingHref} method="get" role="search">
              <label className="visually-hidden" htmlFor="igm-news-search">
                {m.searchPlaceholder}
              </label>
              <input
                id="igm-news-search"
                type="search"
                name="q"
                defaultValue={q ?? ""}
                placeholder={m.searchPlaceholder}
              />
              <button type="submit" aria-label={m.searchSubmit}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path
                    d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM21 21l-4.35-4.35"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </form>
          </div>

          {q ? (
            <p className="igm-news-listing-results">
              {m.resultsCount.replace("{count}", String(totalDocs)).replace("{query}", q)}
            </p>
          ) : null}

          {articles.length > 0 ? (
            <div className="igm-news-listing-grid">
              {articles.map((article, index) => (
                <NewsListingCard
                  key={article.id}
                  article={article}
                  locale={locale}
                  index={index}
                  variant={variant}
                />
              ))}
            </div>
          ) : (
            <p className="igm-news-listing-empty">{q ? m.emptySearch : m.empty}</p>
          )}

          <NewsListingPagination
            locale={locale}
            variant={variant}
            page={page}
            totalPages={totalPages}
            q={q}
            ariaLabel={m.paginationLabel}
            nextLabel={m.nextPage}
          />
        </div>
      </section>
    </main>
  );
}

export default NewsListingView;
