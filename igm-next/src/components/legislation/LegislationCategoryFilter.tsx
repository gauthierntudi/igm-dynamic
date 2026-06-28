"use client";

import { ChevronDown } from "lucide-react";

import type { SupportedLocale } from "@/i18n/locales";
import { hrefForRoute } from "@/i18n/paths";
import {
  LEGISLATION_CATEGORIES,
  type LegislationCategory,
} from "@/lib/legislation/constants";

type Props = {
  locale: SupportedLocale;
  category: LegislationCategory;
  labels: Record<LegislationCategory, string>;
  filterLabel: string;
};

export function LegislationCategoryFilter({
  locale,
  category,
  labels,
  filterLabel,
}: Props) {
  return (
    <div className="igm-legislation-filter">
      <label className="igm-legislation-filter__label" htmlFor="igm-legislation-category">
        {filterLabel}
      </label>
      <div className="igm-legislation-filter__control">
        <select
          id="igm-legislation-category"
          className="igm-legislation-filter__select"
          value={category}
          onChange={(event) => {
            const next = event.target.value as LegislationCategory;
            if (next !== category) {
              window.location.href = hrefForRoute(next, locale);
            }
          }}
        >
          {LEGISLATION_CATEGORIES.map((key) => (
            <option key={key} value={key}>
              {labels[key]}
            </option>
          ))}
        </select>
        <ChevronDown className="igm-legislation-filter__icon" size={18} aria-hidden />
      </div>
    </div>
  );
}
