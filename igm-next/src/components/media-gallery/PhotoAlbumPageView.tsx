import { HeaderHeroDarkBody } from "@/components/cms/HeaderHeroDarkBody";
import { AboutBreadcrumbHero } from "@/components/cms/who-we-are/AboutBreadcrumbHero";
import { PhotoMasonryGrid } from "@/components/media-gallery/PhotoMasonryGrid";
import type { SupportedLocale } from "@/i18n/locales";
import { hrefForRoute } from "@/i18n/paths";
import type { ResolvedPhotoAlbumDetail } from "@/lib/cms/photo-albums/types";

import "@/components/cms/who-we-are/about-page.css";
import "./media-gallery-page.css";

type Props = {
  locale: SupportedLocale;
  album: ResolvedPhotoAlbumDetail;
  heroImageSrc: string;
  photosHeroTitle: string;
};

export function PhotoAlbumPageView({
  locale,
  album,
  heroImageSrc,
  photosHeroTitle,
}: Props) {
  return (
    <main className="igm-about-page igm-media-gallery-page" data-igm-page="photo-album">
      <HeaderHeroDarkBody />

      <AboutBreadcrumbHero
        locale={locale}
        title={album.title}
        breadcrumbTitle={album.title}
        heroImageSrc={heroImageSrc}
        subtitle={album.summary ?? undefined}
        parentBreadcrumb={{
          href: hrefForRoute("photos", locale),
          label: photosHeroTitle,
        }}
      />

      <section className="igm-media-gallery-section">
        <div className="about-wrap">
          <PhotoMasonryGrid locale={locale} photos={album.photos} albumTitle={album.title} />
        </div>
      </section>
    </main>
  );
}
