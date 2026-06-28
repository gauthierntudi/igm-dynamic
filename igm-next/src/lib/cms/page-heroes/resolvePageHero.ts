import {
  PAGE_HERO_CTA_FIELD,
  PAGE_HERO_DEFAULT,
  PAGE_HERO_DEFAULT_FALLBACK,
  PAGE_HERO_FIELD,
  type PageHeroCtaRouteKey,
  type PageHeroRouteKey,
} from "@/lib/page-heroes/constants";
import { withDeployedBase } from "@/lib/deployBasePath";

import { tryResolveHeroMediaSrc } from "../resolveHeroMediaSrc";
import type { CmsPage } from "../types";
import type { CmsPageHeroesSettings } from "./types";

export function resolvePageHeroImage(
  settings: CmsPageHeroesSettings | null | undefined,
  routeKey: PageHeroRouteKey,
  page?: CmsPage | null,
): string {
  const globalMedia = settings?.[PAGE_HERO_FIELD[routeKey]];
  const fromGlobal = tryResolveHeroMediaSrc(
    typeof globalMedia === "object" ? globalMedia : null,
  );
  if (fromGlobal) return fromGlobal;

  const pageMedia = page?.hero?.media;
  const fromPage = tryResolveHeroMediaSrc(
    typeof pageMedia === "object" ? pageMedia : null,
  );
  if (fromPage) return fromPage;

  const fallback = PAGE_HERO_DEFAULT[routeKey] ?? PAGE_HERO_DEFAULT_FALLBACK;
  return withDeployedBase(fallback);
}

export function resolvePageCtaHeroImage(
  settings: CmsPageHeroesSettings | null | undefined,
  routeKey: PageHeroCtaRouteKey,
  page: CmsPage | null | undefined,
  heroImageSrc: string,
): string {
  const ctaField = PAGE_HERO_CTA_FIELD[routeKey];
  const fromGlobal = tryResolveHeroMediaSrc(
    typeof settings?.[ctaField] === "object" ? settings[ctaField] : null,
  );
  if (fromGlobal) return fromGlobal;

  const pageCtaMedia = page?.hero?.ctaMedia;
  const fromPage = tryResolveHeroMediaSrc(
    typeof pageCtaMedia === "object" ? pageCtaMedia : null,
  );
  if (fromPage) return fromPage;

  return heroImageSrc;
}
