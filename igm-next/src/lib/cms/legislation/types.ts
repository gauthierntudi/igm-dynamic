import type { LegislationCategory } from "@/lib/legislation/constants";

import type { CmsMedia } from "../types";

export type CmsLegislationSettings = {
  ordinancesHeroImage?: CmsMedia | number | null;
  lawsHeroImage?: CmsMedia | number | null;
  decreesHeroImage?: CmsMedia | number | null;
  decisionsHeroImage?: CmsMedia | number | null;
};

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
