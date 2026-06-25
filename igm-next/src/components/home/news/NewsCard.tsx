import {
  NEWS_CARD_EXCERPT_MAX_LENGTH,
  NEWS_CARD_TITLE_MAX_LENGTH,
  truncateNewsCardText,
} from "@/lib/newsDisplay";

function ReadMoreArrow() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path
        d="M1 9L9 1M9 1C7.22222 1.33333 3.33333 2 1 1M9 1C8.66667 2.66667 8 6.33333 9 9"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

type Props = {
  href: string;
  coverSrc: string;
  category: string;
  date: string;
  title: string;
  excerpt: string;
  readMoreLabel: string;
};

export function NewsCard({
  href,
  coverSrc,
  category,
  date,
  title,
  excerpt,
  readMoreLabel,
}: Props) {
  const displayTitle = truncateNewsCardText(title, NEWS_CARD_TITLE_MAX_LENGTH);
  const displayExcerpt = truncateNewsCardText(excerpt, NEWS_CARD_EXCERPT_MAX_LENGTH);

  return (
    <div className="menu-blog-card igm-news-card">
      <a className="blog-img" href={href}>
        <img src={coverSrc} alt={displayTitle} loading="lazy" decoding="async" />
      </a>
      <div className="blog-content">
        <ul className="blog-meta">
          <li>
            <a href={href}>{category}</a>
          </li>
          <li className="blog-date">
            <a href={href}>{date}</a>
          </li>
        </ul>
        <h5>
          <a href={href}>{displayTitle}</a>
        </h5>
        <p className="igm-news-excerpt">{displayExcerpt}</p>
        <a className="read-more-btn" href={href}>
          {readMoreLabel}
          <ReadMoreArrow />
        </a>
      </div>
    </div>
  );
}
