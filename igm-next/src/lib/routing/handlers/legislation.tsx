import type { Metadata } from "next";

import { LegislationPageView } from "@/components/legislation/LegislationPageView";
import { getLegislationDocuments } from "@/lib/cms/legislation/getLegislationDocuments";
import { getLegislationSettings } from "@/lib/cms/legislation/getLegislationSettings";
import { resolveLegislationHeroBanner } from "@/lib/cms/legislation/resolveLegislationBanner";
import { resolveLegislationHeroImage } from "@/lib/cms/legislation/resolveLegislationHero";
import { tryResolveHeroMediaSrc } from "@/lib/cms/resolveHeroMediaSrc";
import { getMessages } from "@/i18n/messages";

import { siteMeta } from "../siteMeta";
import type { SiteRoute } from "../types";

type LegislationRoute = Extract<SiteRoute, { kind: "legislation" }>;

export async function renderLegislationRoute(route: LegislationRoute) {
  const { locale, category } = route;
  const [documents, legislationSettings] = await Promise.all([
    getLegislationDocuments(category, locale),
    getLegislationSettings(locale),
  ]);
  const heroImageSrc = resolveLegislationHeroImage(legislationSettings, category);
  const heroBanner = resolveLegislationHeroBanner(legislationSettings, category, locale);
  return (
    <LegislationPageView
      locale={locale}
      category={category}
      documents={documents}
      heroImageSrc={heroImageSrc}
      heroTitle={heroBanner.title}
      heroSubtitle={heroBanner.subtitle}
    />
  );
}

export async function buildLegislationMetadata(route: LegislationRoute): Promise<Metadata> {
  const { locale, pathSegments, category } = route;
  const meta = getMessages(locale).legislationPage.categories[category];
  const legislationSettings = await getLegislationSettings(locale);
  const heroField = {
    ordinances: "ordinancesHeroImage",
    laws: "lawsHeroImage",
    decrees: "decreesHeroImage",
    decisions: "decisionsHeroImage",
  } as const;
  const heroMedia = legislationSettings?.[heroField[category]];

  return siteMeta(locale, pathSegments, {
    title: meta.metaTitle,
    description: meta.metaDescription,
    image: tryResolveHeroMediaSrc(
      heroMedia && typeof heroMedia === "object" ? heroMedia : null,
    ),
  });
}
