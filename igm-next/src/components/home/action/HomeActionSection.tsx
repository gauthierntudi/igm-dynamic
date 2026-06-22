import type { SupportedLocale } from "@/i18n/locales";
import { localizeHref } from "@/i18n/paths";
import type { CmsHomeActionSection } from "@/lib/cms/home/types";

import { PrimaryBtn4Content } from "../banner/PrimaryBtn4Content";
import {
  FeatureCardArrow,
  FeatureCardShape,
  featureCardVariantClass,
} from "./FeatureCardDecorations";

type Props = {
  actionSection?: CmsHomeActionSection | null;
  locale: SupportedLocale;
};

type ResolvedItem = {
  id: string;
  title: string;
  text: string;
};

function CardTitle({ title }: { title: string }) {
  const lines = title.split("\n");
  return (
    <h4>
      {lines.map((line, index) => (
        <span key={index}>
          {line}
          {index < lines.length - 1 ? <br /> : null}
        </span>
      ))}
    </h4>
  );
}

function resolveItems(
  items: CmsHomeActionSection["items"],
): ResolvedItem[] {
  if (!items?.length) return [];

  return items
    .map((item, index) => {
      const title = item.title?.trim();
      const text = item.text?.trim();
      if (!title || !text) return null;

      return {
        id: item.id ?? `action-item-${index}`,
        title,
        text,
      };
    })
    .filter((item): item is ResolvedItem => item !== null);
}

export function hasActionContent(
  actionSection: CmsHomeActionSection | null | undefined,
): boolean {
  if (!actionSection) return false;

  const hasHeader = Boolean(
    actionSection.titlePrefix?.trim() ||
      actionSection.titleHighlight?.trim() ||
      actionSection.titleSuffix?.trim() ||
      actionSection.lead?.trim(),
  );
  const hasItems = actionSection.items?.some(
    (item) => item.title?.trim() && item.text?.trim(),
  );
  const hasCta = Boolean(
    actionSection.ctaLead?.trim() ||
      (actionSection.ctaLabel?.trim() && actionSection.ctaHref?.trim()),
  );

  return Boolean(hasHeader || hasItems || hasCta);
}

export function HomeActionSection({ actionSection, locale }: Props) {
  if (!hasActionContent(actionSection)) return null;

  const titlePrefix = actionSection?.titlePrefix?.trim();
  const titleHighlight = actionSection?.titleHighlight?.trim();
  const titleSuffix = actionSection?.titleSuffix?.trim();
  const lead = actionSection?.lead?.trim();
  const items = resolveItems(actionSection?.items);
  const ctaLead = actionSection?.ctaLead?.trim();
  const ctaLabel = actionSection?.ctaLabel?.trim();
  const ctaHref = ctaLabel
    ? localizeHref(actionSection?.ctaHref?.trim() || "/contact", locale)
    : null;

  const hasTitle = Boolean(titlePrefix || titleHighlight || titleSuffix);

  return (
    <div className="home4-feature-section mb-130">
      <div className="container">
        {hasTitle || lead ? (
          <div className="row justify-content-lg-end mb-70">
            <div className="col-xl-12 col-lg-12">
              <div className="row g-4">
                <div
                  className="col-xl-5 col-lg-5 wow animate fadeInLeft"
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
              </div>
            </div>
          </div>
        ) : null}

        {items.length > 0 ? (
          <div className="row g-4 mb-50">
            {items.map((item, index) => {
              const delay = `${(index + 1) * 200}ms`;

              return (
                <div
                  key={item.id}
                  className="col-xl-3 col-lg-4 col-md-6 wow animate fadeInDown"
                  data-wow-delay={delay}
                  data-wow-duration="1500ms"
                >
                  <div className={featureCardVariantClass(index)}>
                    <FeatureCardArrow />
                    <FeatureCardShape />
                    <div className="feature-content">
                      <CardTitle title={item.title} />
                      <p>{item.text}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}

        {ctaLead || ctaHref ? (
          <div
            className="row justify-content-center wow animate fadeInUp"
            data-wow-delay="200ms"
            data-wow-duration="1500ms"
          >
            <div className="col-xl-6 col-lg-8 col-md-10">
              <div className="contact-btn-area two">
                {ctaLead ? <h6>{ctaLead}</h6> : null}
                {ctaHref && ctaLabel ? (
                  <a className="primary-btn4 transparent" href={ctaHref}>
                    <PrimaryBtn4Content label={ctaLabel} />
                  </a>
                ) : null}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default HomeActionSection;
