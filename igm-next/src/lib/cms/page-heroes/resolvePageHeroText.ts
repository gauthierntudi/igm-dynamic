import type { SupportedLocale } from "@/i18n/locales";
import { getMessages } from "@/i18n/messages";
import type { PageHeroRouteKey } from "@/lib/page-heroes/constants";
import {
  getDefaultPageHeroTitle,
  isPageHeroTextRouteKey,
  PAGE_HERO_SUBTITLE_FIELD,
  PAGE_HERO_TITLE_FIELD,
  type PageHeroTextRouteKey,
} from "@/lib/page-heroes/textDefaults";

import type { CmsPageHeroesSettings } from "./types";

const PAGE_HERO_NAV_LABEL: Partial<
  Record<PageHeroRouteKey, keyof ReturnType<typeof getMessages>["nav"]>
> = {
  contact: "contact",
  pressKit: "pressKit",
};

export function resolvePageHeroTitle(
  settings: CmsPageHeroesSettings | null | undefined,
  routeKey: PageHeroRouteKey,
  locale: SupportedLocale,
): string {
  if (!isPageHeroTextRouteKey(routeKey)) {
    const navKey = PAGE_HERO_NAV_LABEL[routeKey];
    if (navKey) {
      return getMessages(locale).nav[navKey];
    }
    return routeKey;
  }

  const field = PAGE_HERO_TITLE_FIELD[routeKey];
  return settings?.[field]?.trim() || getDefaultPageHeroTitle(routeKey, locale);
}

export function resolvePageHeroSubtitle(
  settings: CmsPageHeroesSettings | null | undefined,
  routeKey: PageHeroRouteKey,
): string | undefined {
  if (!isPageHeroTextRouteKey(routeKey)) {
    return undefined;
  }

  const field = PAGE_HERO_SUBTITLE_FIELD[routeKey];
  const value = settings?.[field]?.trim();
  return value || undefined;
}

export function resolvePageHeroBanner(
  settings: CmsPageHeroesSettings | null | undefined,
  routeKey: PageHeroTextRouteKey,
  locale: SupportedLocale,
): { title: string; subtitle?: string } {
  return {
    title: resolvePageHeroTitle(settings, routeKey, locale),
    subtitle: resolvePageHeroSubtitle(settings, routeKey),
  };
}
