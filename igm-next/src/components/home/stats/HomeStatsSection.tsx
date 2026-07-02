import type { CmsHomeStatsSection } from "@/lib/cms/home/types";
import type { CmsStat } from "@/lib/cms/types";
import { isHomeStatsSectionVisible } from "@/lib/featureFlags";

const CIRCLE_PATH = "M18 4 a 14 14 0 0 1 0 28 a 14 14 0 0 1 0 -28";

/** Pourcentages visuels des anneaux (indépendants de la valeur affichée). */
const CHART_PERCENTAGES = [60, 65, 70, 55, 70, 68];

type Props = {
  statsSection?: CmsHomeStatsSection | null;
  stats: CmsStat[];
};

export function hasStatsContent(
  statsSection: CmsHomeStatsSection | null | undefined,
  stats: CmsStat[],
): boolean {
  const hasHeader = Boolean(statsSection?.title?.trim() || statsSection?.lead?.trim());
  const hasItems = stats.some((stat) => stat.label?.trim());
  return hasHeader || hasItems;
}

function chartPercentage(index: number): number {
  return CHART_PERCENTAGES[index % CHART_PERCENTAGES.length] ?? 60;
}

export function HomeStatsSection({ statsSection, stats }: Props) {
  if (!isHomeStatsSectionVisible() || !hasStatsContent(statsSection, stats)) {
    return null;
  }

  const title = statsSection?.title?.trim();
  const lead = statsSection?.lead?.trim();
  const items = [...stats]
    .filter((stat) => stat.label?.trim())
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  return (
    <div className="igm-chiffres-section mb-60">
      <div className="container">
        {title || lead ? (
          <div className="section-title four mb-60 text-center wow animate fadeInUp">
            {title ? (
              <h2 style={{ fontFamily: "'Google Sans', sans-serif", fontWeight: 700 }}>
                {title}
              </h2>
            ) : null}
            {lead ? (
              <p
                style={{
                  fontFamily: "'Google Sans', sans-serif",
                  maxWidth: "800px",
                  margin: "0 auto",
                }}
              >
                {lead}
              </p>
            ) : null}
          </div>
        ) : null}

        {items.length > 0 ? (
          <div className="row g-4 justify-content-center">
            {items.map((stat, index) => {
              const percentage = chartPercentage(index);
              const delay = `${(index + 1) * 100}ms`;

              return (
                <div
                  key={stat.key}
                  className="col-lg-2 col-md-4 col-6 wow animate fadeInUp"
                  data-wow-delay={delay}
                  data-wow-duration="1500ms"
                >
                  <div className="chiffre-item">
                    <div className="circle-chart-wrapper">
                      <svg className="circle-chart" viewBox="0 0 36 36" aria-hidden>
                        <path className="circle-chart-bg" d={CIRCLE_PATH} />
                        <path
                          className="circle-chart-fill"
                          strokeDasharray="0, 100"
                          data-percentage={percentage}
                          d={CIRCLE_PATH}
                        />
                      </svg>
                      <div className="circle-chart-percentage">
                        <span
                          className="counter"
                          data-stat-key={stat.key}
                          data-target={stat.value}
                          suppressHydrationWarning
                        >
                          0
                        </span>
                        {stat.suffix?.trim() ? stat.suffix.trim() : null}
                      </div>
                    </div>
                    <h6>{stat.label.trim()}</h6>
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default HomeStatsSection;
