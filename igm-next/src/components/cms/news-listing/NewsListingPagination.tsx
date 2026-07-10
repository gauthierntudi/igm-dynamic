import Link from "next/link";

import type { SupportedLocale } from "@/i18n/locales";
import { hrefForNewsListing, hrefForPressReviewListing } from "@/i18n/paths";

import type { NewsListingVariant } from "./NewsListingView";

type Props = {
  locale: SupportedLocale;
  variant?: NewsListingVariant;
  page: number;
  totalPages: number;
  q?: string;
  ariaLabel: string;
  nextLabel: string;
};

function pageItems(current: number, total: number): (number | "ellipsis")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const items: (number | "ellipsis")[] = [1];

  if (current > 3) items.push("ellipsis");

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  for (let p = start; p <= end; p += 1) {
    if (!items.includes(p)) items.push(p);
  }

  if (current < total - 2) items.push("ellipsis");
  if (!items.includes(total)) items.push(total);

  return items;
}

export function NewsListingPagination({
  locale,
  variant = "news",
  page,
  totalPages,
  q,
  ariaLabel,
  nextLabel,
}: Props) {
  if (totalPages <= 1) return null;

  const hrefForListing =
    variant === "pressReview" ? hrefForPressReviewListing : hrefForNewsListing;
  const items = pageItems(page, totalPages);

  return (
    <nav className="igm-news-listing-pagination" aria-label={ariaLabel}>
      <ul>
        {items.map((item, index) =>
          item === "ellipsis" ? (
            <li key={`ellipsis-${index}`} className="igm-news-listing-pagination-ellipsis">
              …
            </li>
          ) : (
            <li key={item}>
              {item === page ? (
                <span className="is-current" aria-current="page">
                  {item}
                </span>
              ) : (
                <Link href={hrefForListing(locale, { page: item, q })}>{item}</Link>
              )}
            </li>
          ),
        )}
        {page < totalPages ? (
          <li>
            <Link
              href={hrefForListing(locale, { page: page + 1, q })}
              className="igm-news-listing-pagination-next"
              aria-label={nextLabel}
            >
              ›
            </Link>
          </li>
        ) : null}
      </ul>
    </nav>
  );
}
