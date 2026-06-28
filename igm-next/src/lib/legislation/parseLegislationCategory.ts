import type { SupportedLocale } from "@/i18n/locales";
import { findRouteKey } from "@/i18n/paths";
import {
  isLegislationCategory,
  type LegislationCategory,
} from "@/lib/legislation/constants";

export function parseLegislationCategory(
  slug: string,
  locale: SupportedLocale,
): LegislationCategory | null {
  const routeKey = findRouteKey(slug, locale);
  if (!routeKey || !isLegislationCategory(routeKey)) return null;
  return routeKey;
}
