import type { SupportedLocale } from "@/i18n/locales";
import { localizeHref } from "@/i18n/paths";
import { withDeployedBase } from "@/lib/deployBasePath";
import type { CmsHomeStrategy } from "@/lib/cms/home/types";

import { StrategyCheckIcon, StrategyCta } from "./StrategyParts";
import { resolveStrategyVideoSrc } from "./resolveStrategyMedia";

type Props = {
  strategy: CmsHomeStrategy;
  locale: SupportedLocale;
};

type AxisLike = {
  label?: string | null;
  highlight?: string | null;
  text?: string | null;
  id?: string | null;
};

function resolveListLabel(item: AxisLike): string {
  if (item.label?.trim()) return item.label.trim();
  const highlight = item.highlight?.trim() ?? "";
  const text = item.text?.trim() ?? "";
  return [highlight, text].filter(Boolean).join(" ").trim();
}

export function hasStrategyContent(
  strategy: CmsHomeStrategy | null | undefined,
): strategy is CmsHomeStrategy {
  if (!strategy) return false;
  const ambitions =
    strategy.ambitions?.some((item) => item.label?.trim()) ?? false;
  const axes = strategy.axes?.some((item) => resolveListLabel(item)) ?? false;
  return Boolean(
    strategy.title?.trim() ||
      strategy.lead?.trim() ||
      ambitions ||
      axes ||
      strategy.ctaLabel?.trim(),
  );
}

export function HomeStrategySection({ strategy, locale }: Props) {
  if (!hasStrategyContent(strategy)) return null;

  const ambitions =
    strategy.ambitions?.map(resolveListLabel).filter(Boolean) ?? [];
  const axes = strategy.axes?.map(resolveListLabel).filter(Boolean) ?? [];
  const ctaLabel = strategy.ctaLabel?.trim();
  const ctaHref = ctaLabel
    ? localizeHref(strategy.ctaHref?.trim() || "/contact", locale)
    : null;
  const videoSrc = resolveStrategyVideoSrc(strategy.video);
  const vectorSrc = withDeployedBase("/assets/img/home5/home5-about-section-vector1.svg");

  return (
    <div className="home5-about-section home4-services-section mb-0">
      <div className="video-area">
        <video autoPlay loop muted playsInline src={videoSrc} />
      </div>
      <div className="about-wrapper about-wrapper-bg">
        <img src={vectorSrc} alt="" className="vector1" />
        <div className="container">
          <div className="row gy-md-4 gy-5">
            <div
              className="col-xl-4 col-lg-5 col-md-6 wow animate fadeInLeft"
              data-wow-delay="200ms"
              data-wow-duration="1500ms"
            >
              <div className="section-title four white">
                {strategy.title?.trim() ? <h2>{strategy.title.trim()}</h2> : null}
                {strategy.lead?.trim() ? <p>{strategy.lead.trim()}</p> : null}
                {ambitions.length > 0 ? (
                  <ul className="strategy-ambitions-list">
                    {ambitions.map((label, index) => (
                      <li key={`ambition-${index}`}>
                        <StrategyCheckIcon />
                        <span>{label}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </div>
            <div
              className="col-xxl-5 col-xl-4 col-lg-5 col-md-6 d-flex justify-content-md-center wow animate fadeInUp"
              data-wow-delay="400ms"
              data-wow-duration="1500ms"
            >
              {axes.length > 0 ? (
                <div className="benefit-area">
                  {strategy.axesTitle?.trim() ? (
                    <h5>{strategy.axesTitle.trim()}</h5>
                  ) : null}
                  <ul>
                    {axes.map((label, index) => (
                      <li key={`axis-${index}`}>
                        <StrategyCheckIcon />
                        <span>{label}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
            <div
              className="col-xxl-3 col-lg-4 wow animate fadeInRight"
              data-wow-delay="200ms"
              data-wow-duration="1500ms"
            >
              {ctaHref && ctaLabel ? (
                <div className="counter-and-btn-area strategy-cta-area">
                  <StrategyCta label={ctaLabel} href={ctaHref} />
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomeStrategySection;
