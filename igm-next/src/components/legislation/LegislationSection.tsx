"use client";

import { useState } from "react";
import { Search } from "lucide-react";

import { LegislationCategoryFilter } from "@/components/legislation/LegislationCategoryFilter";
import { LegislationDocumentsPanel } from "@/components/legislation/LegislationDocumentsPanel";
import type { SupportedLocale } from "@/i18n/locales";
import type { CmsLegislationDocument } from "@/lib/cms/legislation/types";
import type { LegislationCategory } from "@/lib/legislation/constants";

type Props = {
  locale: SupportedLocale;
  category: LegislationCategory;
  documents: CmsLegislationDocument[];
  categoryLabels: Record<LegislationCategory, string>;
  filterLabel: string;
  searchPlaceholder: string;
  eyebrow: string;
  heading: string;
  lead: string;
};

export function LegislationSection({
  locale,
  category,
  documents,
  categoryLabels,
  filterLabel,
  searchPlaceholder,
  eyebrow,
  heading,
  lead,
}: Props) {
  const [query, setQuery] = useState("");

  return (
    <>
      <div className="igm-legislation-header">
        <div className="igm-legislation-intro">
          <p className="igm-legislation-eyebrow">{eyebrow}</p>
          <h2 className="igm-legislation-heading">{heading}</h2>
          <p className="igm-legislation-lead">{lead}</p>
        </div>

        <div className="igm-legislation-header-controls">
          <LegislationCategoryFilter
            locale={locale}
            category={category}
            labels={categoryLabels}
            filterLabel={filterLabel}
          />
          <label className="igm-legislation-search">
            <Search size={18} aria-hidden />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={searchPlaceholder}
            />
          </label>
        </div>
      </div>

      <LegislationDocumentsPanel locale={locale} documents={documents} query={query} />
    </>
  );
}
