import { existsSync } from "node:fs";
import path from "node:path";

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import dynamic from "next/dynamic";

import { CmsPageView } from "@/components/cms/CmsPageView";
import { DenoncerPageContent } from "@/components/signalement/DenoncerPageContent";
import { applyHomeToHtml } from "@/lib/cms/applyHome";
import { getHome, getHomePageBundle, getPageBySlug } from "@/lib/cms/client";
import { stripAboutSection } from "@/lib/cms/home/stripAboutSection";
import { stripBannerSection } from "@/lib/cms/home/stripBannerSection";
import { stripOrgChartSection } from "@/lib/cms/home/stripOrgChartSection";
import { stripActionSection } from "@/lib/cms/home/stripActionSection";
import { stripPartnersSection } from "@/lib/cms/home/stripPartnersSection";
import { stripStatsSection } from "@/lib/cms/home/stripStatsSection";
import { stripStrategySection } from "@/lib/cms/home/stripStrategySection";
import { loadHomeHtmlFile } from "@/lib/cms/homeHtmlCache";
import { deployedBasePath } from "@/lib/deployBasePath";
import { getMessages } from "@/i18n/messages";
import { parseLocaleFromSegments, type SupportedLocale } from "@/i18n/locales";
import { findRouteKey, hrefForRoute } from "@/i18n/paths";

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
  const noScripts = stripAllScripts(noOrgChart);
  const { stats, home, news } = await getHomePageBundle(locale);
  const maxNews = home?.newsSection?.maxItems ?? 6;
  const bannerSlides = home?.bannerSlides?.filter((slide) => slide.title?.trim()) ?? [];
  const withHome = applyHomeToHtml(
    noScripts,
    home ? { home, news: news.slice(0, maxNews), locale } : null,
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

  const slug = pageSlugFromSegments(pathSegments);
  const page = await getPageBySlug(slug, locale);

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

  return {
    title: getMessages(locale).underConstruction.metaTitle,
  };
}

export default async function TemplatePage({
  params,
}: {
  params: Promise<{ path?: string[] }>;
}) {
  const { path: segments = [] } = await params;
  const { locale, pathSegments } = parseLocaleFromSegments(segments);

  if (isPublishedHomePage(pathSegments)) {
    return renderHomePage(locale);
  }

  const slug = pageSlugFromSegments(pathSegments);

  if (findRouteKey(slug, locale) === "report") {
    return <DenoncerPageContent locale={locale} />;
  }

  const page = await getPageBySlug(slug, locale);

  if (page) {
    return <CmsPageView page={page} locale={locale} />;
  }

  return <UnderConstruction locale={locale} />;
}
