import { HeaderHeroDarkBody } from "@/components/cms/HeaderHeroDarkBody";
import { AboutBreadcrumbHero } from "@/components/cms/who-we-are/AboutBreadcrumbHero";
import { HomeOrgChartSection } from "@/components/home/orgchart/HomeOrgChartSection";
import type { SupportedLocale } from "@/i18n/locales";
import type { CmsHomeOrgChartSection } from "@/lib/cms/home/types";

import "@/components/cms/who-we-are/about-page.css";
import "./orgchart-page.css";

type Props = {
  locale: SupportedLocale;
  orgChartSection?: CmsHomeOrgChartSection | null;
  heroImageSrc: string;
  heroTitle: string;
  heroSubtitle?: string;
};

export function OrgChartPageView({
  locale,
  orgChartSection,
  heroImageSrc,
  heroTitle,
  heroSubtitle,
}: Props) {
  return (
    <main className="igm-about-page igm-orgchart-page" data-igm-page="org-chart">
      <HeaderHeroDarkBody />

      <AboutBreadcrumbHero
        locale={locale}
        title={heroTitle}
        breadcrumbTitle={heroTitle}
        heroImageSrc={heroImageSrc}
        subtitle={heroSubtitle}
      />

      <section className="igm-orgchart-page-section">
        <HomeOrgChartSection
          variant="page"
          orgChartSection={orgChartSection}
          locale={locale}
        />
      </section>
    </main>
  );
}
