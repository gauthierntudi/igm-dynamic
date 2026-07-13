import type { RouteKey } from "@/i18n/paths";

export const LEGISLATION_CATEGORIES = [
  "ordinances",
  "laws",
  "decrees",
  "arretes",
  "decisions",
] as const;

export type LegislationCategory = (typeof LEGISLATION_CATEGORIES)[number];

export function isLegislationCategory(value: string): value is LegislationCategory {
  return (LEGISLATION_CATEGORIES as readonly string[]).includes(value);
}

export function legislationCategoryFromRoute(routeKey: RouteKey | null): LegislationCategory | null {
  if (!routeKey) return null;
  return isLegislationCategory(routeKey) ? routeKey : null;
}

export const LEGISLATION_CATEGORY_LABELS: Record<
  LegislationCategory,
  { fr: string; en: string }
> = {
  ordinances: { fr: "Ordonnances", en: "Ordinances" },
  laws: { fr: "Lois", en: "Laws" },
  decrees: { fr: "Décrets", en: "Decrees" },
  arretes: { fr: "Arrêtés", en: "Orders" },
  decisions: { fr: "Décisions", en: "Decisions" },
};
