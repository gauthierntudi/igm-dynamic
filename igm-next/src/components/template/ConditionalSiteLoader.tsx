import { headers } from "next/headers";

import { SiteLoader } from "@/components/template/SiteLoader";
import { isSupportedLocale, type SupportedLocale } from "@/i18n/locales";
import { shouldShowSiteLoader } from "@/lib/template/shouldShowSiteLoader";

function resolveLoaderLocale(value: string | null): SupportedLocale {
  if (value && isSupportedLocale(value)) return value;
  return "fr";
}

export async function ConditionalSiteLoader() {
  if (!(await shouldShowSiteLoader())) return null;

  const locale = resolveLoaderLocale((await headers()).get("x-igm-locale"));
  return <SiteLoader locale={locale} />;
}
