import { HeaderHeroDarkBody } from "@/components/cms/HeaderHeroDarkBody";
import { AboutBreadcrumbHero } from "@/components/cms/who-we-are/AboutBreadcrumbHero";
import { PhotoAlbumsGrid } from "@/components/media-gallery/PhotoAlbumsGrid";
import type { SupportedLocale } from "@/i18n/locales";
import { getMessages } from "@/i18n/messages";
import type { ResolvedPhotoAlbumSummary } from "@/lib/cms/photo-albums/types";

import "@/components/cms/who-we-are/about-page.css";
import "./media-gallery-page.css";

type Props = {
  locale: SupportedLocale;
  albums: ResolvedPhotoAlbumSummary[];
  heroImageSrc: string;
};

export function PhotoAlbumsPageView({ locale, albums, heroImageSrc }: Props) {
  const categoryMeta = getMessages(locale).mediaGalleryPage.categories.photos;

  return (
    <main className="igm-about-page igm-media-gallery-page" data-igm-page="photo-albums">
      <HeaderHeroDarkBody />

      <AboutBreadcrumbHero
        locale={locale}
        title={categoryMeta.title}
        breadcrumbTitle={categoryMeta.title}
        heroImageSrc={heroImageSrc}
        subtitle={categoryMeta.lead}
      />

      <section className="igm-media-gallery-section">
        <div className="about-wrap">
          <PhotoAlbumsGrid locale={locale} albums={albums} />
        </div>
      </section>
    </main>
  );
}
