import type { SupportedLocale } from "@/i18n/locales";
import { hrefForNewsListing } from "@/i18n/paths";
import { getMessages } from "@/i18n/messages";
import type { CmsNews } from "@/lib/cms/types";
import {
  NEWS_LISTING_HERO_COUNT,
  NEWS_LISTING_PAGE_SIZE,
} from "@/lib/newsListing";

import { NewsListingCard } from "./NewsListingCard";
import { NewsListingHeroSlider } from "./NewsListingHeroSlider";
import { NewsListingPagination } from "./NewsListingPagination";

type Props = {
  locale: SupportedLocale;
  heroArticles: CmsNews[];
  articles: CmsNews[];
  page: number;
  totalPages: number;
  totalDocs: number;
  q?: string;
};

export function NewsListingView({
  locale,
  heroArticles,
  articles,
  page,
  totalPages,
  totalDocs,
  q,
}: Props) {
  const m = getMessages(locale).newsListing;
  const listingHref = hrefForNewsListing(locale);

  return (
    <main className="igm-news-listing" data-igm-page="news-listing">
      <NewsListingHeroSlider
        articles={heroArticles}
        locale={locale}
        sectionLabel={m.sectionLabel}
      />

      <section className="igm-news-listing-body">
        <div className="container">
          <div className="igm-news-listing-toolbar">
            <h1 className="igm-news-listing-heading">{m.exploreTitle}</h1>
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
                />
              ))}
            </div>
          ) : (
            <p className="igm-news-listing-empty">{q ? m.emptySearch : m.empty}</p>
          )}

          <NewsListingPagination
            locale={locale}
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
