import type { SupportedLocale } from "@/i18n/locales";

import { getPageBySlug } from "./client";
import { mergePageWithDefault } from "./defaultPagesSeed";
import type { CmsPage } from "./types";

export async function getPageContent(
  slug: string,
  locale: SupportedLocale,
): Promise<CmsPage | null> {
  const page = await getPageBySlug(slug, locale);
  return mergePageWithDefault(page, slug, locale);
}
