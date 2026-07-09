import type { SupportedLocale } from "@/i18n/locales";
import { hrefForRoute, localizeHref } from "@/i18n/paths";
import type { CmsHomeOrgChartSection } from "@/lib/cms/home/types";

import { PrimaryBtn4Content } from "../banner/PrimaryBtn4Content";
import { OrgChartFlowDiagram } from "./OrgChartFlowDiagram";
import {
  resolveOrgChartImageAlt,
  resolveOrgChartImageSrc,
} from "./resolveOrgChartMedia";
import { TeamSectionArrow } from "./TeamSectionArrow";

type Props = {
  orgChartSection?: CmsHomeOrgChartSection | null;
  locale: SupportedLocale;
  variant?: "home" | "page";
};

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
  const hasDiagram = Boolean(resolveOrgChartImageSrc(orgChartSection.diagram));
  const hasCta = Boolean(
    orgChartSection.ctaSidebarTitle?.trim() ||
      (orgChartSection.ctaLabel?.trim() && orgChartSection.ctaHref?.trim()),
  );

  return Boolean(hasHeader || hasDiagram || hasCta);
}

export function HomeOrgChartSection({
  orgChartSection,
  locale,
  variant = "home",
}: Props) {
  const isPage = variant === "page";

  if (!isPage && !hasOrgChartContent(orgChartSection)) return null;

  const titlePrefix = orgChartSection?.titlePrefix?.trim();
  const titleHighlight = orgChartSection?.titleHighlight?.trim();
  const titleSuffix = orgChartSection?.titleSuffix?.trim();
  const lead = orgChartSection?.lead?.trim();
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

  const orgChartStage = (
    <div className="igm-orgchart-stage igm-orgchart-stage--fullwidth">
      {diagramSrc ? (
        <div className="igm-orgchart-diagram">
          <img src={diagramSrc} alt={diagramAlt} loading="lazy" decoding="async" />
        </div>
      ) : (
        <OrgChartFlowDiagram locale={locale} />
      )}
    </div>
  );

  return (
    <div className={sectionClassName}>
      {!isPage ? (
        <div className="container">
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
        </div>
      ) : null}

      {isPage ? (
        orgChartStage
      ) : (
        <div
          className="wow animate fadeInUp"
          data-wow-delay="200ms"
          data-wow-duration="1500ms"
        >
          {orgChartStage}
        </div>
      )}
    </div>
  );
}

export default HomeOrgChartSection;
