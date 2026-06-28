"use client";

import { ArrowUpRight, Images } from "lucide-react";
import Link from "next/link";

import type { SupportedLocale } from "@/i18n/locales";
import { hrefForPhotoAlbum } from "@/i18n/paths";
import { getMessages } from "@/i18n/messages";
import type { ResolvedPhotoAlbumSummary } from "@/lib/cms/photo-albums/types";

type Props = {
  locale: SupportedLocale;
  albums: ResolvedPhotoAlbumSummary[];
};

function formatDate(value: string | null | undefined, locale: SupportedLocale): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function PhotoAlbumsGrid({ locale, albums }: Props) {
  const t = getMessages(locale).mediaGalleryPage;

  if (albums.length === 0) {
    return <p className="igm-media-gallery-empty">{t.emptyAlbums}</p>;
  }

  return (
    <div className="igm-albums-grid">
      {albums.map((album) => {
        const dateLabel = formatDate(album.publishedAt, locale);
        const countLabel = t.photoCount.replace("{count}", String(album.photoCount));

        return (
          <article key={album.id} className="igm-album-card">
            <Link
              href={hrefForPhotoAlbum(album.slug, locale)}
              className="igm-album-card__link"
              aria-label={`${t.openAlbum}: ${album.title}`}
            >
              <span className="igm-album-card__cover">
                {album.coverSrc ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    className="igm-album-card__image"
                    src={album.coverSrc}
                    alt=""
                    loading="lazy"
                  />
                ) : (
                  <span className="igm-album-card__placeholder" aria-hidden />
                )}
                <span className="igm-album-card__shade" aria-hidden />
                <span className="igm-album-card__badge">
                  <Images size={15} strokeWidth={2} aria-hidden />
                  {countLabel}
                </span>
                <span className="igm-album-card__cta">
                  {t.viewAlbum}
                  <ArrowUpRight size={16} strokeWidth={2} aria-hidden />
                </span>
              </span>

              <span className="igm-album-card__body">
                <strong className="igm-album-card__title">{album.title}</strong>
                {album.summary ? (
                  <span className="igm-album-card__summary">{album.summary}</span>
                ) : null}
                {dateLabel ? (
                  <time className="igm-album-card__date" dateTime={album.publishedAt ?? undefined}>
                    {dateLabel}
                  </time>
                ) : null}
              </span>
            </Link>
          </article>
        );
      })}
    </div>
  );
}
