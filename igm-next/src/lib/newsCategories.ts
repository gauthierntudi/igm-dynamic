import type { SupportedLocale } from "@/i18n/locales";

export const CUSTOM_NEWS_CATEGORY = "custom" as const;

export const NEWS_CATEGORY_VALUES = [
  "inspection",
  "cadastre",
  "digitalisation",
  "conformite",
  "communique-presse",
  CUSTOM_NEWS_CATEGORY,
] as const;

export type NewsCategoryValue = (typeof NEWS_CATEGORY_VALUES)[number];

export const NEWS_CATEGORY_OPTIONS: { label: string; value: NewsCategoryValue }[] = [
  { label: "Inspection", value: "inspection" },
  { label: "Cadastre", value: "cadastre" },
  { label: "Digitalisation", value: "digitalisation" },
  { label: "Conformité", value: "conformite" },
  { label: "Communiqué de presse", value: "communique-presse" },
  { label: "Personnaliser", value: CUSTOM_NEWS_CATEGORY },
];

const LABELS_FR: Record<Exclude<NewsCategoryValue, typeof CUSTOM_NEWS_CATEGORY>, string> = {
  inspection: "Inspection",
  cadastre: "Cadastre",
  digitalisation: "Digitalisation",
  conformite: "Conformité",
  "communique-presse": "Communiqué de presse",
};

const LABELS_EN: Record<Exclude<NewsCategoryValue, typeof CUSTOM_NEWS_CATEGORY>, string> = {
  inspection: "Inspection",
  cadastre: "Cadastre",
  digitalisation: "Digitalisation",
  conformite: "Compliance",
  "communique-presse": "Press release",
};

export function resolveNewsCategoryLabel(
  category: string | null | undefined,
  categoryCustom: string | null | undefined,
  locale: SupportedLocale = "fr",
): string | null {
  const custom = categoryCustom?.trim();
  if (!category?.trim()) return custom || null;

  const value = category.trim();
  if (value === CUSTOM_NEWS_CATEGORY) return custom || null;

  const labels = locale === "en" ? LABELS_EN : LABELS_FR;
  const known = labels[value as keyof typeof labels];
  if (known) return known;

  return value;
}
