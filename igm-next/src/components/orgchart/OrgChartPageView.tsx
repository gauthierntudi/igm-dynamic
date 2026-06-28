import { HeaderHeroDarkBody } from "@/components/cms/HeaderHeroDarkBody";
import { AboutBreadcrumbHero } from "@/components/cms/who-we-are/AboutBreadcrumbHero";
import { HomeOrgChartSection } from "@/components/home/orgchart/HomeOrgChartSection";
import type { SupportedLocale } from "@/i18n/locales";
import { getMessages } from "@/i18n/messages";
import type { CmsHomeOrgChartSection } from "@/lib/cms/home/types";

import "@/components/cms/who-we-are/about-page.css";
import "./orgchart-page.css";

type Props = {
  locale: SupportedLocale;
  orgChartSection?: CmsHomeOrgChartSection | null;
  heroImageSrc: string;
};

export function OrgChartPageView({ locale, orgChartSection, heroImageSrc }: Props) {
  const t = getMessages(locale);
  const title = t.nav.orgChart;
  const subtitle =
    orgChartSection?.lead?.trim() ||
    (locale === "en"
      ? "Structure of the General Inspectorate of Mines under Decree No. 23/19."
      : "Structure de l'Inspection Générale des Mines conformément au Décret n° 23/19.");

  return (
    <main className="igm-about-page igm-orgchart-page" data-igm-page="org-chart">
      <HeaderHeroDarkBody />

      <AboutBreadcrumbHero
        locale={locale}
        title={title}
        breadcrumbTitle={title}
        heroImageSrc={heroImageSrc}
        subtitle={subtitle}
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
