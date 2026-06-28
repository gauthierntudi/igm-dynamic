import type { PageHeroRouteKey } from "@/lib/page-heroes/constants";

import type { CmsMedia } from "../types";

export type CmsPageHeroesSettings = {
  [K in PageHeroRouteKey as `${K}HeroImage`]?: CmsMedia | number | null;
} & {
  fraudCtaHeroImage?: CmsMedia | number | null;
  smugglingCtaHeroImage?: CmsMedia | number | null;
  sanctionsCtaHeroImage?: CmsMedia | number | null;
};
