import dynamic from "next/dynamic";

import { getHomePageBundle } from "@/lib/cms/client";
import type { SupportedLocale } from "@/i18n/locales";

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

export async function renderHomePage(locale: SupportedLocale) {
  const { stats, home, news } = await getHomePageBundle(locale);
  const bannerSlides = home?.bannerSlides?.filter((slide) => slide.title?.trim()) ?? [];

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
    </main>
  );
}
