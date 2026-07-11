import type { SupportedLocale } from "@/i18n/locales";
import { getMessages } from "@/i18n/messages";

import type { CmsContactPage, ResolvedContactPage } from "./types";

function pickText(value: string | null | undefined, fallback: string): string {
  return value?.trim() || fallback;
}

export function resolveContactPage(
  cms: CmsContactPage | null | undefined,
  locale: SupportedLocale,
): ResolvedContactPage {
  const t = getMessages(locale).contactPage;

  return {
    seoTitle: pickText(cms?.seoTitle, t.metaTitle),
    seoDescription: pickText(cms?.seoDescription, t.metaDescription),
    heroTitle: pickText(cms?.heroTitle, t.heroTitle),
    heroLead: cms?.heroLead?.trim() || undefined,
    eyebrow: pickText(cms?.eyebrow, t.eyebrow),
    formTitle: pickText(cms?.formTitle, t.formTitle),
    infoTitle: pickText(cms?.infoTitle, t.infoTitle),
    infoLead: pickText(cms?.infoLead, t.infoLead),
  };
}
