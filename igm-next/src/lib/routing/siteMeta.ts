import type { Metadata } from "next";

import { buildPathname, buildSiteMetadata } from "@/lib/seo/buildSiteMetadata";
import type { SupportedLocale } from "@/i18n/locales";

export type SiteMetaInput = Omit<Parameters<typeof buildSiteMetadata>[0], "pathname" | "locale">;

export function cmsMediaForOg(
  media: { filename?: string | null; url?: string | null; prefix?: string | null } | string | number | null | undefined,
) {
  return media && typeof media === "object" ? media : null;
}

export function siteMeta(
  locale: SupportedLocale,
  pathSegments: string[],
  input: SiteMetaInput,
): Metadata {
  return buildSiteMetadata({
    ...input,
    locale,
    pathname: buildPathname(locale, pathSegments),
  });
}
