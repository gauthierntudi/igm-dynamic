import type { Metadata } from "next";

import { OrgChartPageView } from "@/components/orgchart/OrgChartPageView";
import { getHome } from "@/lib/cms/client";
import { getPageHeroesSettings } from "@/lib/cms/page-heroes/getPageHeroesSettings";
import { resolvePageHeroImage } from "@/lib/cms/page-heroes/resolvePageHero";
import { getMessages } from "@/i18n/messages";

import { siteMeta } from "../siteMeta";
import type { SiteRoute } from "../types";

type OrgChartRoute = Extract<SiteRoute, { kind: "org-chart" }>;

export async function renderOrgChartRoute(route: OrgChartRoute) {
  const { locale } = route;
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

export async function buildOrgChartMetadata(route: OrgChartRoute): Promise<Metadata> {
  const { locale, pathSegments } = route;
  const home = await getHome(locale);
  const title = `${getMessages(locale).nav.orgChart} — IGM`;
  const description =
    home?.orgChartSection?.lead?.trim() ||
    (locale === "en"
      ? "Organizational chart of the General Inspectorate of Mines in the DRC."
      : "Organigramme de l'Inspection Générale des Mines en RDC.");

  return siteMeta(locale, pathSegments, { title, description });
}
