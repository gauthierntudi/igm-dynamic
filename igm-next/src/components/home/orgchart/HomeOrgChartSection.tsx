import type { SupportedLocale } from "@/i18n/locales";
import { hrefForRoute, localizeHref } from "@/i18n/paths";
import { isHomeOrgChartUnitsVisible } from "@/lib/featureFlags";
import type { CmsHomeOrgChartSection, CmsHomeOrgChartUnit } from "@/lib/cms/home/types";

import { PrimaryBtn4Content } from "../banner/PrimaryBtn4Content";
import { OrgChartDecreeDiagram } from "./OrgChartDecreeDiagram";
import {
  resolveOrgChartImageAlt,
  resolveOrgChartImageSrc,
} from "./resolveOrgChartMedia";
import { TeamCardDivider, TeamSectionArrow } from "./TeamSectionArrow";

type Props = {
  orgChartSection?: CmsHomeOrgChartSection | null;
  locale: SupportedLocale;
  variant?: "home" | "page";
};

type ResolvedUnit = {
  id: string;
  name: string;
  role: string;
  imageSrc: string | null;
  imageAlt: string;
};

function resolveUnits(units: CmsHomeOrgChartUnit[] | null | undefined): ResolvedUnit[] {
  if (!units?.length) return [];

  return units
    .map((unit, index) => {
      const name = unit.name?.trim();
      const role = unit.role?.trim();
      if (!name || !role) return null;

      return {
        id: unit.id ?? `org-unit-${index}`,
        name,
        role,
        imageSrc: resolveOrgChartImageSrc(unit.image),
        imageAlt: resolveOrgChartImageAlt(unit.image, name),
      };
    })
    .filter((unit): unit is ResolvedUnit => unit !== null);
}

export function hasOrgChartContent(
  orgChartSection: CmsHomeOrgChartSection | null | undefined,
): boolean {
  if (!orgChartSection) return false;

  const hasHeader = Boolean(
    orgChartSection.titlePrefix?.trim() ||
      orgChartSection.titleHighlight?.trim() ||
      orgChartSection.titleSuffix?.trim() ||
      orgChartSection.lead?.trim(),
  );
  const hasUnits =
    isHomeOrgChartUnitsVisible() &&
    orgChartSection.units?.some((unit) => unit.name?.trim() && unit.role?.trim());
  const hasDiagram = Boolean(resolveOrgChartImageSrc(orgChartSection.diagram));
  const hasCta = Boolean(
    orgChartSection.ctaSidebarTitle?.trim() ||
      (orgChartSection.ctaLabel?.trim() && orgChartSection.ctaHref?.trim()),
  );

  return Boolean(hasHeader || hasUnits || hasDiagram || hasCta);
}

function OrgChartUnitCard({ unit }: { unit: ResolvedUnit }) {
  return (
    <div className="team-card igm-orgchart-card">
      <div className="team-img">
        {unit.imageSrc ? (
          <img src={unit.imageSrc} alt={unit.imageAlt} loading="lazy" decoding="async" />
        ) : (
          <div className="igm-orgchart-placeholder" aria-hidden>
            <span>{unit.name.charAt(0)}</span>
          </div>
        )}
      </div>
      <div className="team-content">
        <h5>{unit.name}</h5>
        <span>{unit.role}</span>
        <TeamCardDivider />
      </div>
    </div>
  );
}

export function HomeOrgChartSection({
  orgChartSection,
  locale,
  variant = "home",
}: Props) {
  const isPage = variant === "page";

  if (!isPage && !hasOrgChartContent(orgChartSection)) return null;

  const showUnits = isHomeOrgChartUnitsVisible();
  const titlePrefix = orgChartSection?.titlePrefix?.trim();
  const titleHighlight = orgChartSection?.titleHighlight?.trim();
  const titleSuffix = orgChartSection?.titleSuffix?.trim();
  const lead = orgChartSection?.lead?.trim();
  const units = showUnits ? resolveUnits(orgChartSection?.units) : [];
  const diagramSrc = resolveOrgChartImageSrc(orgChartSection?.diagram);
  const diagramAlt = resolveOrgChartImageAlt(
    orgChartSection?.diagram,
    titleHighlight ? `Organigramme — ${titleHighlight}` : "Organigramme IGM",
  );
  const ctaSidebarTitle = orgChartSection?.ctaSidebarTitle?.trim();
  const ctaLabel = orgChartSection?.ctaLabel?.trim();
  const ctaHref = ctaLabel
    ? localizeHref(
        orgChartSection?.ctaHref?.trim() || hrefForRoute("orgChart", locale),
        locale,
      )
    : null;

  const hasTitle = Boolean(titlePrefix || titleHighlight || titleSuffix);
  const showHomeHeader = !isPage && (hasTitle || lead || ctaSidebarTitle || ctaHref);
  const showCtaSidebar = !isPage && (ctaSidebarTitle || ctaHref);

  const sectionClassName = isPage
    ? "home4-team-section igm-orgchart-section--page"
    : "home4-team-section mb-130";

  return (
    <div className={sectionClassName}>
      <div className={isPage ? undefined : "container"}>
        {showHomeHeader ? (
          <div className="row justify-content-lg-end mb-70">
            <div className="col-xl-10 col-lg-11">
              <div className="row g-4 justify-content-between align-items-end">
                {hasTitle || lead ? (
                  <div
                    className="col-xl-5 col-md-6 wow animate fadeInDown"
                    data-wow-delay="200ms"
                    data-wow-duration="1500ms"
                  >
                    <div className="section-title2">
                      {hasTitle ? (
                        <h2>
                          {titlePrefix ? `${titlePrefix} ` : null}
                          {titleHighlight ? <strong>{titleHighlight}</strong> : null}
                          {titleSuffix ? ` ${titleSuffix}` : null}
                        </h2>
                      ) : null}
                      {lead ? <p>{lead}</p> : null}
                    </div>
                  </div>
                ) : null}
                {showCtaSidebar ? (
                  <div
                    className="col-lg-3 col-md-6 d-flex justify-content-md-end wow animate fadeInRight"
                    data-wow-delay="200ms"
                    data-wow-duration="1500ms"
                  >
                    <div className="button-area">
                      <TeamSectionArrow />
                      {ctaSidebarTitle ? <h5>{ctaSidebarTitle}</h5> : null}
                      {ctaHref && ctaLabel ? (
                        <a className="primary-btn4 black-bg" href={ctaHref}>
                          <PrimaryBtn4Content label={ctaLabel} />
                        </a>
                      ) : null}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        ) : null}

        {isPage ? (
          <div className="igm-orgchart-stage">
            {diagramSrc ? (
              <div className="igm-orgchart-diagram">
                <img src={diagramSrc} alt={diagramAlt} loading="lazy" decoding="async" />
              </div>
            ) : (
              <OrgChartDecreeDiagram locale={locale} />
            )}
          </div>
        ) : (
          <div
            className="row wow animate fadeInUp"
            data-wow-delay="200ms"
            data-wow-duration="1500ms"
          >
            <div className="col-lg-12">
              <div className="igm-orgchart-stage">
                {diagramSrc ? (
                  <div className="igm-orgchart-diagram">
                    <img src={diagramSrc} alt={diagramAlt} loading="lazy" decoding="async" />
                  </div>
                ) : (
                  <OrgChartDecreeDiagram locale={locale} />
                )}
              </div>
            </div>
          </div>
        )}

        {showUnits && units.length > 0 ? (
          <>
            <div className="row mb-50 mt-50">
              <div className="col-lg-12">
                <div className="swiper home4-team-slider">
                  <div className="swiper-wrapper">
                    {units.map((unit) => (
                      <div key={unit.id} className="swiper-slide">
                        <OrgChartUnitCard unit={unit} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-lg-12 d-flex justify-content-center">
                <div className="swiper-pagination1" />
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}

export default HomeOrgChartSection;
