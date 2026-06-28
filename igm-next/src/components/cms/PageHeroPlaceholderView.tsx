import Link from "next/link";

import { HeaderHeroDarkBody } from "@/components/cms/HeaderHeroDarkBody";
import { AboutBreadcrumbHero } from "@/components/cms/who-we-are/AboutBreadcrumbHero";
import type { SupportedLocale } from "@/i18n/locales";
import { getMessages } from "@/i18n/messages";
import { hrefForRoute } from "@/i18n/paths";
import type { PageHeroRouteKey } from "@/lib/page-heroes/constants";

import "@/components/cms/who-we-are/about-page.css";

const ROUTE_NAV_LABEL: Record<PageHeroRouteKey, keyof ReturnType<typeof getMessages>["nav"]> = {
  orgChart: "orgChart",
  map: "map",
  fraud: "miningFraud",
  smuggling: "miningSmuggling",
  sanctions: "sanctions",
  report: "report",
  contact: "contact",
  photos: "photos",
  videos: "videos",
  audios: "audios",
};

type Props = {
  locale: SupportedLocale;
  routeKey: PageHeroRouteKey;
  heroImageSrc: string;
};

export function PageHeroPlaceholderView({ locale, routeKey, heroImageSrc }: Props) {
  const messages = getMessages(locale);
  const title = messages.nav[ROUTE_NAV_LABEL[routeKey]];
  const m = messages.underConstruction;
  const homeHref = hrefForRoute("home", locale);

  return (
    <main className="igm-about-page" data-igm-page={`placeholder-${routeKey}`}>
      <HeaderHeroDarkBody />

      <AboutBreadcrumbHero
        locale={locale}
        title={title}
        breadcrumbTitle={title}
        heroImageSrc={heroImageSrc}
      />

      <section className="igm-under-construction" role="status" aria-live="polite">
        <div className="igm-under-construction-inner">
          <div className="igm-under-construction-card">
            <div className="igm-under-construction-icon" aria-hidden>
              <span className="igm-under-construction-cogs">
                <i className="bx bx-cog igm-under-construction-cog igm-under-construction-cog-a" />
                <i className="bx bx-cog igm-under-construction-cog igm-under-construction-cog-b" />
              </span>
            </div>
            <p className="igm-under-construction-eyebrow">{m.eyebrow}</p>
            <h1 className="igm-under-construction-title">{m.title}</h1>
            <p className="igm-under-construction-lead">{m.lead}</p>
            <div className="igm-under-construction-actions">
              <Link
                href={homeHref}
                className="igm-under-construction-btn igm-under-construction-btn-primary"
              >
                {m.backHome}
              </Link>
              <a
                href="tel:+243976844563"
                className="igm-under-construction-btn igm-under-construction-btn-ghost"
              >
                {m.callUs}
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
