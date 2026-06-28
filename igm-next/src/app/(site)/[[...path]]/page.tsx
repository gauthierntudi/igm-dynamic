import { existsSync } from "node:fs";
import path from "node:path";

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import dynamic from "next/dynamic";

import { CartographyPageView } from "@/components/cartography/CartographyPageView";
import { ContactPageView } from "@/components/contact/ContactPageView";
import { PhotoAlbumPageView } from "@/components/media-gallery/PhotoAlbumPageView";
import { PhotoAlbumsPageView } from "@/components/media-gallery/PhotoAlbumsPageView";
import { VideoGalleryPageView } from "@/components/media-gallery/VideoGalleryPageView";
import { LegislationPageView } from "@/components/legislation/LegislationPageView";
import { PageHeroPlaceholderView } from "@/components/cms/PageHeroPlaceholderView";
import { OrgChartPageView } from "@/components/orgchart/OrgChartPageView";
import { CmsHistoryPageView } from "@/components/cms/CmsHistoryPageView";
import { CmsNewsArticleView } from "@/components/cms/CmsNewsArticleView";
import { NewsListingView } from "@/components/cms/news-listing/NewsListingView";
import { WhoWeArePageView } from "@/components/cms/who-we-are/WhoWeArePageView";
import { WhoWeAreHistoryPageView } from "@/components/cms/who-we-are/WhoWeAreHistoryPageView";
import { DenoncerPageContent } from "@/components/signalement/DenoncerPageContent";
import { applyHomeToHtml } from "@/lib/cms/applyHome";
import { getMediaGalleryVideos } from "@/lib/cms/media-gallery/getMediaGalleryItems";
import { resolveMediaGalleryItems } from "@/lib/cms/media-gallery/resolveMediaGalleryItem";
import { getPhotoAlbumBySlug, getPhotoAlbums } from "@/lib/cms/photo-albums/getPhotoAlbums";
import {
  resolvePhotoAlbumDetail,
  resolvePhotoAlbumSummaries,
} from "@/lib/cms/photo-albums/resolvePhotoAlbum";
import { getContactPageSettings } from "@/lib/cms/contact/getContactPageSettings";
import { resolveContactPage } from "@/lib/cms/contact/resolveContactPage";
import { getWhoWeArePageContent } from "@/lib/cms/who-we-are/getWhoWeArePageContent";
import { getLegislationSettings } from "@/lib/cms/legislation/getLegislationSettings";
import { getPageHeroesSettings } from "@/lib/cms/page-heroes/getPageHeroesSettings";
import {
  getHome,
  getHomePageBundle,
  getNewsBySlug,
  getNewsListing,
  getPublishedNews,
  getSiteSettings,
} from "@/lib/cms/client";
import { resolvePageCtaHeroImage, resolvePageHeroImage } from "@/lib/cms/page-heroes/resolvePageHero";
import { getLegislationDocuments } from "@/lib/cms/legislation/getLegislationDocuments";
import { resolveLegislationHeroImage } from "@/lib/cms/legislation/resolveLegislationHero";
import { getPageContent } from "@/lib/cms/getPageContent";
import { isPageHeroCtaRouteKey, isPageHeroRouteKey } from "@/lib/page-heroes/constants";
import { parseLegislationCategory } from "@/lib/legislation/parseLegislationCategory";
import { stripAboutSection } from "@/lib/cms/home/stripAboutSection";
import { stripBannerSection } from "@/lib/cms/home/stripBannerSection";
import { stripOrgChartSection } from "@/lib/cms/home/stripOrgChartSection";
import { stripActionSection } from "@/lib/cms/home/stripActionSection";
import { stripContactSection } from "@/lib/cms/home/stripContactSection";
import { stripNewsSection } from "@/lib/cms/home/stripNewsSection";
import { stripPartnersSection } from "@/lib/cms/home/stripPartnersSection";
import { stripStatsSection } from "@/lib/cms/home/stripStatsSection";
import { stripStrategySection } from "@/lib/cms/home/stripStrategySection";
import { loadHomeHtmlFile } from "@/lib/cms/homeHtmlCache";
import { ARTICLE_RELATED_NEWS_MAX_ITEMS } from "@/lib/newsDisplay";
import { deployedBasePath } from "@/lib/deployBasePath";
import { getMessages } from "@/i18n/messages";
import { parseLocaleFromSegments, type SupportedLocale } from "@/i18n/locales";
import {
  findRouteKey,
  hrefForRoute,
  isNewsListingPath,
  isPhotosListingPath,
  parseNewsArticleSlug,
  parsePhotoAlbumSlug,
  parseWhoWeAreSection,
} from "@/i18n/paths";
import { getWhoWeAreSectionMeta } from "@/lib/cms/who-we-are/resolveWhoWeArePage";
import {
  NEWS_LISTING_HERO_COUNT,
  NEWS_LISTING_PAGE_SIZE,
} from "@/lib/newsListing";

const HomeBannerSlider = dynamic(
  () => import("@/components/home/banner/HomeBannerSlider"),
  { ssr: true },
);

const HomeAboutSection = dynamic(
  () => import("@/components/home/about/HomeAboutSection"),
  { ssr: true },
);

const HomeStrategySection = dynamic(
  () => import("@/components/home/strategy/HomeStrategySection"),
  { ssr: true },
);

const HomeStatsSection = dynamic(
  () => import("@/components/home/stats/HomeStatsSection"),
  { ssr: true },
);

const HomePartnersSection = dynamic(
  () => import("@/components/home/partners/HomePartnersSection"),
  { ssr: true },
);

const HomeActionSection = dynamic(
  () => import("@/components/home/action/HomeActionSection"),
  { ssr: true },
);

const HomeOrgChartSection = dynamic(
  () => import("@/components/home/orgchart/HomeOrgChartSection"),
  { ssr: true },
);

const HomeContactSection = dynamic(
  () => import("@/components/home/contact/HomeContactSection"),
  { loading: () => null },
);

const HomeNewsSection = dynamic(
  () => import("@/components/home/news/HomeNewsSection"),
  { ssr: true },
);

/** Seules ces routes servent le template d’accueil ; le reste = CMS ou page en construction. */
const PUBLISHED_HOME_FILE = "marketing-agency.html";
const HTML_SUBDIR = "html";

function resolvePublishedHomeAbsolutePath(): string | null {
  const cwd = process.cwd();
  const candidates = [
    path.join(cwd, HTML_SUBDIR, PUBLISHED_HOME_FILE),
    path.join(cwd, PUBLISHED_HOME_FILE),
    path.resolve(cwd, "..", PUBLISHED_HOME_FILE),
  ];
  for (const filePath of candidates) {
    if (existsSync(filePath)) {
      return filePath;
    }
  }
  return null;
}

function isPublishedHomePage(segments: string[]): boolean {
  if (segments.length === 0) return true;
  if (segments.length === 1 && segments[0] === "marketing-agency") return true;
  return false;
}

function pageSlugFromSegments(segments: string[]): string {
  return segments.join("/");
}

function extractBodyInnerHtml(html: string): string | null {
  const lower = html.toLowerCase();

  const bodyStart = lower.indexOf("<body");
  if (bodyStart === -1) return null;

  const bodyOpenEnd = html.indexOf(">", bodyStart);
  if (bodyOpenEnd === -1) return null;

  const bodyEnd = lower.lastIndexOf("</body>");
  if (bodyEnd === -1 || bodyEnd <= bodyOpenEnd) return null;

  return html.slice(bodyOpenEnd + 1, bodyEnd);
}

function stripNextRuntimeScripts(bodyInnerHtml: string): string {
  return bodyInnerHtml.replace(/<script\b[\s\S]*?<\/script>/gi, (scriptTag) => {
    if (
      scriptTag.includes("_next/static/chunks/") ||
      scriptTag.includes("__next_f") ||
      scriptTag.includes("__next_s") ||
      scriptTag.includes("__next")
    ) {
      return "";
    }

    return scriptTag;
  });
}

function stripAllScripts(bodyInnerHtml: string): string {
  return bodyInnerHtml.replace(/<script\b[\s\S]*?<\/script>/gi, "");
}

function rewriteUrls(html: string): string {
  let out = html;

  out = out.replaceAll('src="assets/', 'src="/assets/');
  out = out.replaceAll('href="assets/', 'href="/assets/');
  out = out.replace(/url\(\s*assets\//g, "url(/assets/");

  out = out.replaceAll(
    'href="_next/static/css/',
    'href="/template_next/static/css/',
  );
  out = out.replaceAll(
    'href="_next/static/media/',
    'href="/template_next/static/media/',
  );
  out = out.replaceAll(
    'src="_next/static/media/',
    'src="/template_next/static/media/',
  );

  out = out.replace(/href="([^"]+)\.html"/g, (match, href: string) => {
    if (/^(https?:|mailto:|tel:|#|javascript:)/i.test(href)) {
      return match;
    }

    if (href === "index") return 'href="/"';
    if (href === "marketing-agency") return 'href="/"';

    if (href.startsWith("/")) {
      return `href="${href}"`;
    }

    return `href="/${href}"`;
  });

  return out;
}

function prefixInjectedHtmlRootPaths(html: string): string {
  const basePath = deployedBasePath();
  if (!basePath) return html;

  const prefix = (path: string): string => {
    if (!path.startsWith("/") || path.startsWith("//")) return path;
    if (path === basePath || path.startsWith(`${basePath}/`)) return path;
    return `${basePath}${path}`;
  };

  let out = html.replace(/(href|src)=(["'])(\/[^"']*)\2/gi, (_m, attr: string, quote: string, path: string) => {
    return `${attr}=${quote}${prefix(path)}${quote}`;
  });

  out = out.replace(/url\((["']?)(\/[^)"']+)\1\)/gi, (_m, q: string, path: string) => {
    return `url(${q}${prefix(path)}${q})`;
  });

  return out;
}

function stripSharedChrome(bodyInnerHtml: string): string {
  let out = bodyInnerHtml;

  out = out.replace(
    /<div\b[^>]*class="[^"]*\btt-style-switch\b[^"]*"[^>]*>[\s\S]*?<\/div>/gi,
    "",
  );

  const sidebarStart = out.indexOf('<div class="right-sidebar-menu"');
  const headerStart = out.indexOf("<header", sidebarStart === -1 ? 0 : sidebarStart);
  if (headerStart !== -1) {
    const headerEnd = out.indexOf("</header>", headerStart);
    if (headerEnd !== -1) {
      const start = sidebarStart !== -1 ? sidebarStart : headerStart;
      out = out.slice(0, start) + out.slice(headerEnd + "</header>".length);
    }
  }

  const footerStart = out.indexOf("<footer");
  if (footerStart !== -1) {
    const footerEnd = out.indexOf("</footer>", footerStart);
    if (footerEnd !== -1) {
      out = out.slice(0, footerStart) + out.slice(footerEnd + "</footer>".length);
    }
  }

  return out;
}

function UnderConstruction({ locale }: { locale: SupportedLocale }) {
  const m = getMessages(locale).underConstruction;
  const homeHref = hrefForRoute("home", locale);

  return (
    <main className="igm-under-construction" role="status" aria-live="polite">
      <div className="igm-under-construction-inner">
        <div className="igm-under-construction-card">
          <div className="igm-under-construction-icon" aria-hidden>
            <span className="igm-under-construction-cogs">
              <i className="bx bx-cog igm-under-construction-cog igm-under-construction-cog-a" />
              <i className="bx bx-cog igm-under-construction-cog igm-under-construction-cog-b" />
            </span>
          </div>
          <p className="igm-under-construction-eyebrow">{m.eyebrow}</p>
          <h1 className="igm-under-construction-title">{m.title}</h1>
          <p className="igm-under-construction-lead">{m.lead}</p>
          <div className="igm-under-construction-actions">
            <Link href={homeHref} className="igm-under-construction-btn igm-under-construction-btn-primary">
              {m.backHome}
            </Link>
            <a href="tel:+243976844563" className="igm-under-construction-btn igm-under-construction-btn-ghost">
              {m.callUs}
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}

async function renderHomePage(locale: SupportedLocale) {
  const absoluteFilePath = resolvePublishedHomeAbsolutePath();
  if (!absoluteFilePath) {
    notFound();
  }

  let fullHtml: string;
  try {
    fullHtml = await loadHomeHtmlFile(absoluteFilePath);
  } catch {
    notFound();
  }

  const bodyInnerHtml = extractBodyInnerHtml(fullHtml);
  if (!bodyInnerHtml) notFound();

  const stripped = stripNextRuntimeScripts(bodyInnerHtml);
  const noChrome = stripSharedChrome(stripped);
  const noBanner = stripBannerSection(noChrome);
  const noAbout = stripAboutSection(noBanner);
  const noStrategy = stripStrategySection(noAbout);
  const noStats = stripStatsSection(noStrategy);
  const noPartners = stripPartnersSection(noStats);
  const noAction = stripActionSection(noPartners);
  const noOrgChart = stripOrgChartSection(noAction);
  const noNews = stripNewsSection(noOrgChart);
  const noContact = stripContactSection(noNews);
  const noScripts = stripAllScripts(noContact);
  const { stats, home, news } = await getHomePageBundle(locale);
  const bannerSlides = home?.bannerSlides?.filter((slide) => slide.title?.trim()) ?? [];
  const withHome = applyHomeToHtml(
    noScripts,
    home ? { home, news: [], locale } : null,
  );
  const rewritten = prefixInjectedHtmlRootPaths(rewriteUrls(withHome));

  return (
    <main key={`home-${locale}`}>
      {bannerSlides.length > 0 ? (
        <HomeBannerSlider slides={bannerSlides} locale={locale} />
      ) : null}
      {home?.about ? <HomeAboutSection about={home.about} locale={locale} /> : null}
      {home?.strategy ? (
        <HomeStrategySection strategy={home.strategy} locale={locale} />
      ) : null}
      <HomeStatsSection statsSection={home?.statsSection} stats={stats} />
      <HomePartnersSection partnersSection={home?.partnersSection} />
      <HomeActionSection actionSection={home?.actionSection} locale={locale} />
      <HomeOrgChartSection orgChartSection={home?.orgChartSection} locale={locale} />
      <HomeNewsSection newsSection={home?.newsSection} news={news} locale={locale} />
      <HomeContactSection contactSection={home?.contactSection} locale={locale} />
      <div dangerouslySetInnerHTML={{ __html: rewritten }} />
    </main>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ path?: string[] }>;
}): Promise<Metadata> {
  const { path: segments = [] } = await params;
  const { locale, pathSegments } = parseLocaleFromSegments(segments);

  if (isPublishedHomePage(pathSegments)) {
    const home = await getHome(locale);
    return {
      title: home?.seoTitle?.trim() || "IGM — Inspection Générale des Mines",
      description: home?.seoDescription?.trim() || undefined,
    };
  }

  const newsArticleSlug = parseNewsArticleSlug(pathSegments, locale);
  if (newsArticleSlug) {
    const article = await getNewsBySlug(newsArticleSlug, locale);
    if (article) {
      return {
        title: article.seoTitle?.trim() || `${article.title} — IGM`,
        description: article.seoDescription?.trim() || article.excerpt?.trim() || undefined,
      };
    }
  }

  if (isNewsListingPath(pathSegments, locale)) {
    const m = getMessages(locale).newsListing;
    return {
      title: m.metaTitle,
      description: m.metaDescription,
    };
  }

  const whoWeAreSection = parseWhoWeAreSection(pathSegments, locale);
  if (whoWeAreSection) {
    const whoWeAre = await getWhoWeArePageContent(locale);
    const meta = getWhoWeAreSectionMeta(whoWeAreSection, whoWeAre, locale);
    return {
      title: meta.title,
      description: meta.description,
    };
  }

  const photoAlbumSlug = parsePhotoAlbumSlug(pathSegments, locale);
  if (photoAlbumSlug) {
    const album = await getPhotoAlbumBySlug(photoAlbumSlug, locale);
    if (album) {
      return {
        title: `${album.title} — IGM`,
        description: album.summary?.trim() || undefined,
      };
    }
  }

  if (isPhotosListingPath(pathSegments, locale)) {
    const meta = getMessages(locale).mediaGalleryPage.categories.photos;
    return { title: meta.metaTitle, description: meta.metaDescription };
  }

  const slug = pageSlugFromSegments(pathSegments);
  const page = await getPageContent(slug, locale);

  if (page) {
    return {
      title: page.seoTitle?.trim() || `${page.title} — IGM`,
      description: page.seoDescription?.trim() || page.summary?.trim() || undefined,
    };
  }

  if (findRouteKey(slug, locale) === "report") {
    const m = getMessages(locale).denoncer;
    return { title: m.metaTitle, description: m.metaDescription };
  }

  if (findRouteKey(slug, locale) === "map") {
    const m = getMessages(locale).cartography;
    return { title: m.metaTitle, description: m.metaDescription };
  }

  if (findRouteKey(slug, locale) === "contact") {
    const contactCms = await getContactPageSettings(locale);
    const content = resolveContactPage(contactCms, locale);
    return { title: content.seoTitle, description: content.seoDescription };
  }

  const legislationCategory = parseLegislationCategory(slug, locale);
  if (legislationCategory) {
    const meta = getMessages(locale).legislationPage.categories[legislationCategory];
    return { title: meta.metaTitle, description: meta.metaDescription };
  }

  if (findRouteKey(slug, locale) === "videos") {
    const meta = getMessages(locale).mediaGalleryPage.categories.videos;
    return { title: meta.metaTitle, description: meta.metaDescription };
  }

  if (findRouteKey(slug, locale) === "orgChart") {
    const home = await getHome(locale);
    const title = `${getMessages(locale).nav.orgChart} — IGM`;
    const description =
      home?.orgChartSection?.lead?.trim() ||
      (locale === "en"
        ? "Organizational chart of the General Inspectorate of Mines in the DRC."
        : "Organigramme de l'Inspection Générale des Mines en RDC.");
    return { title, description };
  }

  return {
    title: getMessages(locale).underConstruction.metaTitle,
  };
}

export default async function TemplatePage({
  params,
  searchParams,
}: {
  params: Promise<{ path?: string[] }>;
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  const { path: segments = [] } = await params;
  const { page: pageParam, q: qParam } = await searchParams;
  const { locale, pathSegments } = parseLocaleFromSegments(segments);

  if (isPublishedHomePage(pathSegments)) {
    return renderHomePage(locale);
  }

  const newsArticleSlug = parseNewsArticleSlug(pathSegments, locale);
  if (newsArticleSlug) {
    const article = await getNewsBySlug(newsArticleSlug, locale);
    if (article) {
      const related = await getPublishedNews(ARTICLE_RELATED_NEWS_MAX_ITEMS + 1, locale);
      return <CmsNewsArticleView article={article} related={related} locale={locale} />;
    }
  }

  if (isNewsListingPath(pathSegments, locale)) {
    const page = Math.max(1, Number.parseInt(pageParam ?? "1", 10) || 1);
    const q = qParam?.trim() ?? "";

    const [listing, heroListing] = await Promise.all([
      getNewsListing(locale, {
        page,
        limit: NEWS_LISTING_PAGE_SIZE,
        q: q || undefined,
      }),
      q
        ? Promise.resolve({ docs: [], totalDocs: 0, totalPages: 0, page: 1 })
        : getNewsListing(locale, { page: 1, limit: NEWS_LISTING_HERO_COUNT }),
    ]);

    return (
      <NewsListingView
        locale={locale}
        heroArticles={heroListing.docs}
        articles={listing.docs}
        page={listing.page}
        totalPages={listing.totalPages}
        totalDocs={listing.totalDocs}
        q={q || undefined}
      />
    );
  }

  const whoWeAreSection = parseWhoWeAreSection(pathSegments, locale);
  if (whoWeAreSection === "history") {
    const whoWeAre = await getWhoWeArePageContent(locale);
    return <WhoWeAreHistoryPageView locale={locale} content={whoWeAre} />;
  }

  if (whoWeAreSection) {
    const whoWeAre = await getWhoWeArePageContent(locale);
    return (
      <WhoWeArePageView
        locale={locale}
        activeSection={whoWeAreSection === "about" ? null : whoWeAreSection}
        content={whoWeAre}
      />
    );
  }

  const photoAlbumSlug = parsePhotoAlbumSlug(pathSegments, locale);
  if (photoAlbumSlug) {
    const [album, pageHeroes] = await Promise.all([
      getPhotoAlbumBySlug(photoAlbumSlug, locale),
      getPageHeroesSettings(locale),
    ]);
    const resolved = album ? resolvePhotoAlbumDetail(album) : null;
    if (!resolved) notFound();

    const heroImageSrc =
      resolved.coverSrc ?? resolvePageHeroImage(pageHeroes, "photos");
    return (
      <PhotoAlbumPageView locale={locale} album={resolved} heroImageSrc={heroImageSrc} />
    );
  }

  if (isPhotosListingPath(pathSegments, locale)) {
    const [albums, pageHeroes] = await Promise.all([
      getPhotoAlbums(locale),
      getPageHeroesSettings(locale),
    ]);
    const heroImageSrc = resolvePageHeroImage(pageHeroes, "photos");
    return (
      <PhotoAlbumsPageView
        locale={locale}
        albums={resolvePhotoAlbumSummaries(albums)}
        heroImageSrc={heroImageSrc}
      />
    );
  }

  const slug = pageSlugFromSegments(pathSegments);
  const routeKey = findRouteKey(slug, locale);

  if (routeKey === "report") {
    return <DenoncerPageContent locale={locale} />;
  }

  if (routeKey === "map") {
    const pageHeroes = await getPageHeroesSettings(locale);
    const heroImageSrc = resolvePageHeroImage(pageHeroes, "map");
    return <CartographyPageView locale={locale} heroImageSrc={heroImageSrc} />;
  }

  if (routeKey === "contact") {
    const [settings, pageHeroes, contactCms] = await Promise.all([
      getSiteSettings(locale),
      getPageHeroesSettings(locale),
      getContactPageSettings(locale),
    ]);
    const heroImageSrc = resolvePageHeroImage(pageHeroes, "contact");
    const content = resolveContactPage(contactCms, locale);
    return (
      <ContactPageView
        locale={locale}
        settings={settings}
        heroImageSrc={heroImageSrc}
        content={content}
      />
    );
  }

  const legislationCategory = parseLegislationCategory(slug, locale);
  if (legislationCategory) {
    const [documents, legislationSettings] = await Promise.all([
      getLegislationDocuments(legislationCategory, locale),
      getLegislationSettings(locale),
    ]);
    const heroImageSrc = resolveLegislationHeroImage(legislationSettings, legislationCategory);
    return (
      <LegislationPageView
        locale={locale}
        category={legislationCategory}
        documents={documents}
        heroImageSrc={heroImageSrc}
      />
    );
  }

  if (routeKey === "videos") {
    const [items, pageHeroes] = await Promise.all([
      getMediaGalleryVideos(locale),
      getPageHeroesSettings(locale),
    ]);
    const heroImageSrc = resolvePageHeroImage(pageHeroes, "videos");
    const resolvedItems = resolveMediaGalleryItems(items);
    return (
      <VideoGalleryPageView locale={locale} items={resolvedItems} heroImageSrc={heroImageSrc} />
    );
  }

  if (routeKey === "orgChart") {
    const [home, pageHeroes] = await Promise.all([getHome(locale), getPageHeroesSettings(locale)]);
    const heroImageSrc = resolvePageHeroImage(pageHeroes, "orgChart");
    return (
      <OrgChartPageView
        locale={locale}
        orgChartSection={home?.orgChartSection}
        heroImageSrc={heroImageSrc}
      />
    );
  }

  const page = await getPageContent(slug, locale);

  if (page) {
    const pageHeroes =
      routeKey && isPageHeroRouteKey(routeKey) ? await getPageHeroesSettings(locale) : null;
    const heroImageSrc =
      routeKey && isPageHeroRouteKey(routeKey)
        ? resolvePageHeroImage(pageHeroes, routeKey, page)
        : undefined;
    const ctaHeroImageSrc =
      routeKey && isPageHeroCtaRouteKey(routeKey) && heroImageSrc
        ? resolvePageCtaHeroImage(pageHeroes, routeKey, page, heroImageSrc)
        : undefined;
    return (
      <CmsHistoryPageView
        page={page}
        locale={locale}
        heroImageSrc={heroImageSrc}
        ctaHeroImageSrc={ctaHeroImageSrc}
      />
    );
  }

  if (routeKey && isPageHeroRouteKey(routeKey)) {
    const pageHeroes = await getPageHeroesSettings(locale);
    const heroImageSrc = resolvePageHeroImage(pageHeroes, routeKey);
    return (
      <PageHeroPlaceholderView locale={locale} routeKey={routeKey} heroImageSrc={heroImageSrc} />
    );
  }

  return <UnderConstruction locale={locale} />;
}
