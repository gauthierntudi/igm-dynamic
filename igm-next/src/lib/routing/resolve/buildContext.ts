import { parseLocaleFromSegments } from "@/i18n/locales";

import { pageSlugFromSegments } from "../pathUtils";
import type { MatchContext } from "./types";

export function buildMatchContext(segments: string[]): MatchContext {
  const { locale, pathSegments } = parseLocaleFromSegments(segments);
  return {
    locale,
    pathSegments,
    slug: pageSlugFromSegments(pathSegments),
  };
}
