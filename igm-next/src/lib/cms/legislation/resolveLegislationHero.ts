import type { LegislationCategory } from "@/lib/legislation/constants";

import { resolveHeroMediaSrc } from "../resolveHeroMediaSrc";
import type { CmsLegislationSettings } from "./types";

const DEFAULT_HERO = "/assets/img/img-07.jpg";

const HERO_FIELD: Record<LegislationCategory, keyof CmsLegislationSettings> = {
  ordinances: "ordinancesHeroImage",
  laws: "lawsHeroImage",
  decrees: "decreesHeroImage",
  decisions: "decisionsHeroImage",
};

export function resolveLegislationHeroImage(
  settings: CmsLegislationSettings | null | undefined,
  category: LegislationCategory,
): string {
  const media = settings?.[HERO_FIELD[category]];
  return resolveHeroMediaSrc(typeof media === "object" ? media : null, DEFAULT_HERO);
}
