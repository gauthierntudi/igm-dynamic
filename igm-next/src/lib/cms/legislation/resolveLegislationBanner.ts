import type { SupportedLocale } from "@/i18n/locales";
import { getMessages } from "@/i18n/messages";
import type { LegislationCategory } from "@/lib/legislation/constants";

import type { CmsLegislationSettings } from "./types";

const HERO_TITLE_FIELD: Record<LegislationCategory, keyof CmsLegislationSettings> = {
  ordinances: "ordinancesHeroTitle",
  laws: "lawsHeroTitle",
  decrees: "decreesHeroTitle",
  decisions: "decisionsHeroTitle",
};

const HERO_SUBTITLE_FIELD: Record<LegislationCategory, keyof CmsLegislationSettings> = {
  ordinances: "ordinancesHeroSubtitle",
  laws: "lawsHeroSubtitle",
  decrees: "decreesHeroSubtitle",
  decisions: "decisionsHeroSubtitle",
};

export function resolveLegislationHeroTitle(
  settings: CmsLegislationSettings | null | undefined,
  category: LegislationCategory,
  locale: SupportedLocale,
): string {
  const field = HERO_TITLE_FIELD[category];
  const fallback = getMessages(locale).legislationPage.categories[category].title;
  const value = settings?.[field];
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

export function resolveLegislationHeroSubtitle(
  settings: CmsLegislationSettings | null | undefined,
  category: LegislationCategory,
): string | undefined {
  const field = HERO_SUBTITLE_FIELD[category];
  const value = settings?.[field];
  const trimmed = typeof value === "string" ? value.trim() : "";
  return trimmed || undefined;
}

export function resolveLegislationHeroBanner(
  settings: CmsLegislationSettings | null | undefined,
  category: LegislationCategory,
  locale: SupportedLocale,
): { title: string; subtitle?: string } {
  return {
    title: resolveLegislationHeroTitle(settings, category, locale),
    subtitle: resolveLegislationHeroSubtitle(settings, category),
  };
}
