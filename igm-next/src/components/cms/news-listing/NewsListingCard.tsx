import Link from "next/link";

import type { SupportedLocale } from "@/i18n/locales";
import { hrefForNewsArticle, hrefForPressReviewArticle } from "@/i18n/paths";
import { formatNewsDate } from "@/lib/cms/formatNewsDate";
import type { CmsNews } from "@/lib/cms/types";
import { getMessages } from "@/i18n/messages";
import { resolveNewsCategoryLabel } from "@/lib/newsCategories";
import { truncateNewsCardText } from "@/lib/newsDisplay";
import { NEWS_LISTING_CARD_TITLE_MAX } from "@/lib/newsListing";

import { resolveNewsCoverSrc } from "@/components/home/news/resolveNewsMedia";
import type { NewsListingVariant } from "./NewsListingView";

type Props = {
  article: CmsNews;
  locale: SupportedLocale;
  index?: number;
  variant?: NewsListingVariant;
};

export function NewsListingCard({ article, locale, index = 0, variant = "news" }: Props) {
  const m = getMessages(locale).common;
  const href =
    variant === "pressReview"
      ? hrefForPressReviewArticle(article.slug, locale)
      : hrefForNewsArticle(article.slug, locale);
  const category =
    resolveNewsCategoryLabel(article.category, article.categoryCustom, locale) ||
    m.newsFallback;
  const title = truncateNewsCardText(article.title.trim(), NEWS_LISTING_CARD_TITLE_MAX);
  const date = formatNewsDate(article.publishedAt, locale);
  const coverSrc = resolveNewsCoverSrc(article.cover, index);

  return (
    <article className="igm-news-listing-card">
      <Link href={href} className="igm-news-listing-card-media">
        <img src={coverSrc} alt={title} loading="lazy" decoding="async" />
        <span className="igm-news-listing-card-badge">{category}</span>
      </Link>
      <time className="igm-news-listing-card-date" dateTime={article.publishedAt}>
        {date}
      </time>
      <h3 className="igm-news-listing-card-title">
        <Link href={href}>{title}</Link>
      </h3>
      <p className="igm-news-listing-card-category">{category}</p>
    </article>
  );
}
