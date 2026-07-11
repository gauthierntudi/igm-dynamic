import type { LegislationCategory } from "@/lib/legislation/constants";

import type { CmsMedia } from "../types";

type LegislationHeroImageFields = {
  ordinancesHeroImage?: CmsMedia | number | null;
  lawsHeroImage?: CmsMedia | number | null;
  decreesHeroImage?: CmsMedia | number | null;
  decisionsHeroImage?: CmsMedia | number | null;
};

type LegislationHeroTextFields = {
  [K in LegislationCategory as `${K}HeroTitle`]?: string | null;
} & {
  [K in LegislationCategory as `${K}HeroSubtitle`]?: string | null;
};

export type CmsLegislationSettings = LegislationHeroImageFields & LegislationHeroTextFields;

export type CmsLegislationDocument = {
  id: number;
  title: string;
  category: LegislationCategory;
  reference?: string | null;
  summary?: string | null;
  publishedAt?: string | null;
  order?: number | null;
  file?: CmsMedia | string | number | null;
};
