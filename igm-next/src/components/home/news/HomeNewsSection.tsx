import type { SupportedLocale } from "@/i18n/locales";
import type { CmsHomeNewsSection } from "@/lib/cms/home/types";
import type { CmsNews } from "@/lib/cms/types";

import { HOME_NEWS_MAX_ITEMS } from "@/lib/newsDisplay";

import { NewsCardsSlider } from "./NewsCardsSlider";

type Props = {
  newsSection?: CmsHomeNewsSection | null;
  news: CmsNews[];
  locale: SupportedLocale;
};

function SectionTitle({ title }: { title: string }) {
  const trimmed = title.trim();
  const parts = trimmed.split(/\s+/);

  if (parts.length > 1) {
    return (
      <h2>
        <strong>{parts[0]}</strong> {parts.slice(1).join(" ")}
      </h2>
    );
  }

  return (
    <h2>
      <strong>{trimmed}</strong>
    </h2>
  );
}

export function hasNewsSectionContent(
  newsSection: CmsHomeNewsSection | null | undefined,
  news: CmsNews[],
): boolean {
  return Boolean(newsSection?.title?.trim() && news.length > 0);
}

export function HomeNewsSection({ newsSection, news, locale }: Props) {
  const maxItems = newsSection?.maxItems ?? HOME_NEWS_MAX_ITEMS;
  const items = news.slice(0, maxItems);

  if (!hasNewsSectionContent(newsSection, items)) {
    return null;
  }

  const title = newsSection?.title?.trim() || "Dernières actualités.";
  const lead = newsSection?.lead?.trim();

  return (
    <div className="home4-news-section mb-130">
      <div className="container">
        <div className="row mb-50">
          <div className="col-lg-12">
            <div className="section-title2">
              <SectionTitle title={title} />
              {lead ? <p>{lead}</p> : null}
            </div>
          </div>
        </div>
        <div className="row justify-content-center">
          <div className="col-12">
            <NewsCardsSlider items={items} locale={locale} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomeNewsSection;
