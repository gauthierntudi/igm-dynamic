import type { PageHeroRouteKey } from "@/lib/page-heroes/constants";
import type { PageHeroTextRouteKey } from "@/lib/page-heroes/textDefaults";

import type { CmsMedia } from "../types";

type PageHeroImageFields = {
  [K in PageHeroRouteKey as `${K}HeroImage`]?: CmsMedia | number | null;
};

type PageHeroTextFields = {
  [K in PageHeroTextRouteKey as `${K}HeroTitle`]?: string | null;
} & {
  [K in PageHeroTextRouteKey as `${K}HeroSubtitle`]?: string | null;
};

export type CmsPageHeroesSettings = PageHeroImageFields &
  PageHeroTextFields & {
    fraudCtaHeroImage?: CmsMedia | number | null;
    smugglingCtaHeroImage?: CmsMedia | number | null;
    sanctionsCtaHeroImage?: CmsMedia | number | null;
  };
