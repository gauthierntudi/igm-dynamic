import { HeaderHeroDarkBody } from "@/components/cms/HeaderHeroDarkBody";
import { AboutBreadcrumbHero } from "@/components/cms/who-we-are/AboutBreadcrumbHero";
import { VideoGalleryGrid } from "@/components/media-gallery/VideoGalleryGrid";
import type { SupportedLocale } from "@/i18n/locales";
import { getMessages } from "@/i18n/messages";
import type { ResolvedMediaGalleryItem } from "@/lib/cms/media-gallery/types";
import { MEDIA_GALLERY_CATEGORY_LABELS } from "@/lib/media-gallery/constants";

import "@/components/cms/who-we-are/about-page.css";
import "./media-gallery-page.css";

type Props = {
  locale: SupportedLocale;
  items: ResolvedMediaGalleryItem[];
  heroImageSrc: string;
};

export function VideoGalleryPageView({ locale, items, heroImageSrc }: Props) {
  const categoryMeta = getMessages(locale).mediaGalleryPage.categories.videos;

  return (
    <main className="igm-about-page igm-media-gallery-page" data-igm-page="media-gallery-videos">
      <HeaderHeroDarkBody />

      <AboutBreadcrumbHero
        locale={locale}
        title={categoryMeta.title}
        breadcrumbTitle={categoryMeta.title}
        heroImageSrc={heroImageSrc}
        subtitle={categoryMeta.lead}
        tagline={MEDIA_GALLERY_CATEGORY_LABELS.videos[locale]}
      />

      <section className="igm-media-gallery-section">
        <div className="about-wrap">
          <VideoGalleryGrid locale={locale} items={items} />
        </div>
      </section>
    </main>
  );
}
