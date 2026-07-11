import { HeaderHeroDarkBody } from "@/components/cms/HeaderHeroDarkBody";
import { AboutBreadcrumbHero } from "@/components/cms/who-we-are/AboutBreadcrumbHero";
import { LegislationSection } from "@/components/legislation/LegislationSection";
import type { SupportedLocale } from "@/i18n/locales";
import { getMessages } from "@/i18n/messages";
import type { CmsLegislationDocument } from "@/lib/cms/legislation/types";
import {
  LEGISLATION_CATEGORIES,
  LEGISLATION_CATEGORY_LABELS,
  type LegislationCategory,
} from "@/lib/legislation/constants";
import "@/components/cms/who-we-are/about-page.css";
import "./legislation-page.css";

type Props = {
  locale: SupportedLocale;
  category: LegislationCategory;
  documents: CmsLegislationDocument[];
  heroImageSrc: string;
  heroTitle: string;
  heroSubtitle?: string;
};

export function LegislationPageView({
  locale,
  category,
  documents,
  heroImageSrc,
  heroTitle,
  heroSubtitle,
}: Props) {
  const t = getMessages(locale).legislationPage;
  const categoryLabels = Object.fromEntries(
    LEGISLATION_CATEGORIES.map((key) => [key, t.categories[key].tabLabel]),
  ) as Record<LegislationCategory, string>;

  return (
    <main className="igm-about-page igm-legislation-page" data-igm-page={`legislation-${category}`}>
      <HeaderHeroDarkBody />

      <AboutBreadcrumbHero
        locale={locale}
        title={heroTitle}
        breadcrumbTitle={heroTitle}
        heroImageSrc={heroImageSrc}
        subtitle={heroSubtitle}
        tagline={LEGISLATION_CATEGORY_LABELS[category][locale]}
      />

      <section className="igm-legislation-section">
        <div className="about-wrap">
          <LegislationSection
            locale={locale}
            category={category}
            documents={documents}
            categoryLabels={categoryLabels}
            filterLabel={t.filtersLabel}
            searchPlaceholder={t.searchPlaceholder}
            eyebrow={t.eyebrow}
            heading={t.categories[category].documentsTitle}
            lead={t.categories[category].documentsLead}
          />
        </div>
      </section>
    </main>
  );
}
