import { HeaderHeroDarkBody } from "@/components/cms/HeaderHeroDarkBody";
import { AboutBreadcrumbHero } from "@/components/cms/who-we-are/AboutBreadcrumbHero";
import { PhotoAlbumsGrid } from "@/components/media-gallery/PhotoAlbumsGrid";
import type { SupportedLocale } from "@/i18n/locales";
import type { ResolvedPhotoAlbumSummary } from "@/lib/cms/photo-albums/types";

import "@/components/cms/who-we-are/about-page.css";
import "./media-gallery-page.css";

type Props = {
  locale: SupportedLocale;
  albums: ResolvedPhotoAlbumSummary[];
  heroImageSrc: string;
  heroImageSrcs?: string[];
  heroTitle: string;
  heroSubtitle?: string;
};

export function PhotoAlbumsPageView({
  locale,
  albums,
  heroImageSrc,
  heroImageSrcs,
  heroTitle,
  heroSubtitle,
}: Props) {
  return (
    <main className="igm-about-page igm-media-gallery-page" data-igm-page="photo-albums">
      <HeaderHeroDarkBody />

      <AboutBreadcrumbHero
        locale={locale}
        title={heroTitle}
        breadcrumbTitle={heroTitle}
        heroImageSrc={heroImageSrc}
        heroImageSrcs={heroImageSrcs}
        subtitle={heroSubtitle}
      />

      <section className="igm-media-gallery-section">
        <div className="about-wrap">
          <PhotoAlbumsGrid locale={locale} albums={albums} />
        </div>
      </section>
    </main>
  );
}
