import { HeaderHeroDarkBody } from "@/components/cms/HeaderHeroDarkBody";
import { AboutBreadcrumbHero } from "@/components/cms/who-we-are/AboutBreadcrumbHero";
import { PressKitPdfViewer } from "@/components/press-kit/PressKitPdfViewer";
import type { SupportedLocale } from "@/i18n/locales";
import { getMessages } from "@/i18n/messages";
import type { ResolvedPressKitPage } from "@/lib/cms/press-kit/types";
import type { PdfViewerLabels } from "@/components/legislation/PdfDocumentViewer";

import "@/components/cms/who-we-are/about-page.css";
import "./press-kit-page.css";

type Props = {
  locale: SupportedLocale;
  heroImageSrc: string;
  content: ResolvedPressKitPage;
};

function buildViewerLabels(
  t: ReturnType<typeof getMessages>["pressKitPage"],
): PdfViewerLabels {
  return {
    previousPage: t.viewerPreviousPage,
    nextPage: t.viewerNextPage,
    zoomOut: t.viewerZoomOut,
    zoomIn: t.viewerZoomIn,
    download: t.viewerDownload,
    openNewTab: t.viewerOpenNewTab,
    close: t.viewerClose,
    fullscreen: t.viewerFullscreen,
    exitFullscreen: t.viewerExitFullscreen,
    summary: t.viewerSummary,
    closeSummary: t.viewerCloseSummary,
    noSummary: t.viewerNoSummary,
    loading: t.viewerLoading,
    loadError: t.viewerLoadError,
    openPdf: t.viewerOpenPdf,
  };
}

export function PressKitPageView({ locale, heroImageSrc, content }: Props) {
  const t = getMessages(locale).pressKitPage;
  const viewerLabels = buildViewerLabels(t);

  return (
    <main className="igm-about-page igm-press-kit-page" data-igm-page="press-kit">
      <HeaderHeroDarkBody />

      <AboutBreadcrumbHero
        locale={locale}
        title={content.heroTitle}
        breadcrumbTitle={content.heroTitle}
        heroImageSrc={heroImageSrc}
        subtitle={content.heroLead}
      />

      <section className="igm-press-kit-section">
        <div className="about-wrap">
          {content.intro ? <p className="igm-press-kit-intro">{content.intro}</p> : null}

          {content.hasPdf ? (
            <PressKitPdfViewer
              title={content.pdfTitle}
              viewUrl={content.pdfViewUrl}
              downloadUrl={content.pdfDownloadUrl}
              labels={viewerLabels}
            />
          ) : (
            <p className="igm-press-kit-empty">{t.emptyPdf}</p>
          )}
        </div>
      </section>
    </main>
  );
}
