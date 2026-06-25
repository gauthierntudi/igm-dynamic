import Link from "next/link";

import { ArticleShareSidebar } from "@/components/cms/ArticleShareSidebar";
import { HeaderHeroDarkBody } from "@/components/cms/HeaderHeroDarkBody";
import { NewsCardsSlider } from "@/components/home/news/NewsCardsSlider";
import { resolveNewsCoverSrc } from "@/components/home/news/resolveNewsMedia";
import type { SupportedLocale } from "@/i18n/locales";
import { hrefForRoute } from "@/i18n/paths";
import { formatNewsDate } from "@/lib/cms/formatNewsDate";
import type { CmsNews } from "@/lib/cms/types";
import { getMessages } from "@/i18n/messages";
import { ARTICLE_RELATED_NEWS_MAX_ITEMS } from "@/lib/newsDisplay";
import { resolveNewsCategoryLabel } from "@/lib/newsCategories";

type Props = {
  article: CmsNews;
  related?: CmsNews[];
  locale: SupportedLocale;
};

function SectionTitle({ title }: { title: string }) {
  const parts = title.trim().split(/\s+/);
  if (parts.length > 1) {
    return (
      <h2>
        <strong>{parts[0]}</strong> {parts.slice(1).join(" ")}
      </h2>
    );
  }
  return (
    <h2>
      <strong>{title}</strong>
    </h2>
  );
}

function PrevArrow() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path
        d="M9 2L4 7L9 12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function resolveArticleUrl(newsHref: string, slug: string): string {
  const path = `${newsHref}/${slug}`;
  const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL?.replace(/\/$/, "");
  return serverUrl ? `${serverUrl}${path}` : path;
}

export function CmsNewsArticleView({ article, related = [], locale }: Props) {
  const m = getMessages(locale).newsArticle;
  const common = getMessages(locale).common;
  const newsHref = hrefForRoute("news", locale);
  const coverSrc = resolveNewsCoverSrc(article.cover);
  const category = resolveNewsCategoryLabel(
    article.category,
    article.categoryCustom,
    locale,
  );
  const date = formatNewsDate(article.publishedAt, locale);
  const contentHtml = article.contentHtml?.trim();
  const relatedItems = related
    .filter((item) => item.id !== article.id)
    .slice(0, ARTICLE_RELATED_NEWS_MAX_ITEMS);
  const articleUrl = resolveArticleUrl(newsHref, article.slug);

  return (
    <main className="igm-news-article" data-igm-page="news">
      <HeaderHeroDarkBody />
      <section
        className="igm-news-article-hero"
        style={coverSrc ? { backgroundImage: `url(${coverSrc})` } : undefined}
      >
        <div className="igm-news-article-hero-overlay" aria-hidden />
        <div className="igm-news-article-hero-inner">
          <Link href={newsHref} className="igm-news-article-prev">
            <PrevArrow />
            {m.backToNews}
          </Link>

          <div className="igm-news-article-hero-content">
            <div className="igm-news-article-badges">
              {category ? (
                <span className="igm-news-article-badge igm-news-article-badge-solid">
                  {category}
                </span>
              ) : null}
              <span className="igm-news-article-badge igm-news-article-badge-outline">
                {common.newsFallback}
              </span>
              <time className="igm-news-article-hero-date" dateTime={article.publishedAt}>
                {date}
              </time>
            </div>

            <h1 className="igm-news-article-hero-title">{article.title}</h1>
            {article.excerpt?.trim() ? (
              <p className="igm-news-article-hero-lead">{article.excerpt.trim()}</p>
            ) : null}
          </div>
        </div>
      </section>

      <article className="igm-news-article-shell">
        <div className="igm-news-article-layout">
          <ArticleShareSidebar
            articleUrl={articleUrl}
            title={article.title}
            locale={locale}
          />

          <div className="igm-news-article-main-col">
            {contentHtml ? (
              <div
                className="igm-news-article-prose"
                dangerouslySetInnerHTML={{ __html: contentHtml }}
              />
            ) : (
              <p className="igm-news-article-empty">{m.emptyContent}</p>
            )}
          </div>
        </div>
      </article>

      {relatedItems.length > 0 ? (
        <section className="home4-news-section igm-news-article-related">
          <div className="container">
            <div className="row mb-50">
              <div className="col-lg-12">
                <div className="section-title2">
                  <SectionTitle title={m.relatedTitle} />
                </div>
              </div>
            </div>
            <div className="row justify-content-center">
              <div className="col-12">
                <NewsCardsSlider items={relatedItems} locale={locale} layout="grid" />
              </div>
            </div>
          </div>
        </section>
      ) : null}
    </main>
  );
}
