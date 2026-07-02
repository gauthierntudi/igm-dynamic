import type { Metadata } from "next";

import { WhoWeArePageView } from "@/components/cms/who-we-are/WhoWeArePageView";
import { WhoWeAreHistoryPageView } from "@/components/cms/who-we-are/WhoWeAreHistoryPageView";
import { getWhoWeArePageContent } from "@/lib/cms/who-we-are/getWhoWeArePageContent";
import { getWhoWeAreSectionMeta } from "@/lib/cms/who-we-are/resolveWhoWeArePage";
import { tryResolveHeroMediaSrc } from "@/lib/cms/resolveHeroMediaSrc";

import { siteMeta } from "../siteMeta";
import type { SiteRoute } from "../types";

type WhoWeAreHistoryRoute = Extract<SiteRoute, { kind: "who-we-are-history" }>;
type WhoWeAreSectionRoute = Extract<SiteRoute, { kind: "who-we-are-section" }>;
type WhoWeAreRoute = WhoWeAreHistoryRoute | WhoWeAreSectionRoute;

export async function renderWhoWeAreHistoryRoute(route: WhoWeAreHistoryRoute) {
  const whoWeAre = await getWhoWeArePageContent(route.locale);
  return <WhoWeAreHistoryPageView locale={route.locale} content={whoWeAre} />;
}

export async function renderWhoWeAreSectionRoute(route: WhoWeAreSectionRoute) {
  const whoWeAre = await getWhoWeArePageContent(route.locale);
  return (
    <WhoWeArePageView
      locale={route.locale}
      activeSection={route.section === "about" ? null : route.section}
      content={whoWeAre}
    />
  );
}

export async function buildWhoWeAreMetadata(route: WhoWeAreRoute): Promise<Metadata> {
  const { locale, pathSegments } = route;
  const whoWeAre = await getWhoWeArePageContent(locale);
  const section = route.kind === "who-we-are-history" ? "history" : route.section;
  const meta = getWhoWeAreSectionMeta(section, whoWeAre, locale);
  const sectionImage =
    section === "about"
      ? whoWeAre?.aboutSection?.image
      : section === "history"
        ? whoWeAre?.historySection?.heroImage
        : whoWeAre?.missionSection?.image;

  return siteMeta(locale, pathSegments, {
    title: meta.title,
    description: meta.description,
    image: tryResolveHeroMediaSrc(sectionImage),
  });
}
