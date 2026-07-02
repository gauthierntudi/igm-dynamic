import type { Metadata } from "next";

import { DenoncerPageContent } from "@/components/signalement/DenoncerPageContent";
import { getMessages } from "@/i18n/messages";

import { siteMeta } from "../siteMeta";
import type { SiteRoute } from "../types";

type ReportRoute = Extract<SiteRoute, { kind: "report" }>;

export async function renderReportRoute(route: ReportRoute) {
  return <DenoncerPageContent locale={route.locale} />;
}

export async function buildReportMetadata(route: ReportRoute): Promise<Metadata> {
  const { locale, pathSegments } = route;
  const m = getMessages(locale).denoncer;
  return siteMeta(locale, pathSegments, {
    title: m.metaTitle,
    description: m.metaDescription,
  });
}
