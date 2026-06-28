"use client";

import { ZoomIn } from "lucide-react";
import { useState } from "react";

import type { SupportedLocale } from "@/i18n/locales";
import { getMessages } from "@/i18n/messages";
import type { ResolvedAlbumPhoto } from "@/lib/cms/photo-albums/types";

import { PhotoLightbox } from "./PhotoLightbox";

type Props = {
  locale: SupportedLocale;
  photos: ResolvedAlbumPhoto[];
  albumTitle: string;
};

export function PhotoMasonryGrid({ locale, photos, albumTitle }: Props) {
  const t = getMessages(locale).mediaGalleryPage;
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  if (photos.length === 0) {
    return <p className="igm-media-gallery-empty">{t.emptyAlbumPhotos}</p>;
  }

  return (
    <>
      <div className="igm-media-gallery-grid igm-media-gallery-grid--photos">
        {photos.map((photo, index) => (
          <article key={photo.id} className="igm-media-gallery-card igm-media-gallery-card--photo">
            <button
              type="button"
              className="igm-media-gallery-card__trigger igm-media-gallery-card__trigger--photo"
              onClick={() => setActiveIndex(index)}
              aria-label={`${t.openItem}: ${photo.alt}`}
            >
              <span className="igm-media-gallery-card__media">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo.mediaSrc} alt={photo.alt} loading="lazy" />
                <span className="igm-media-gallery-card__zoom" aria-hidden>
                  <ZoomIn size={22} strokeWidth={2} />
                </span>
              </span>
            </button>
          </article>
        ))}
      </div>

      {activeIndex != null ? (
        <PhotoLightbox
          locale={locale}
          photos={photos}
          activeIndex={activeIndex}
          albumTitle={albumTitle}
          onClose={() => setActiveIndex(null)}
          onIndexChange={setActiveIndex}
        />
      ) : null}
    </>
  );
}
