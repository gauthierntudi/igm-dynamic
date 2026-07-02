import { headers } from "next/headers";

import { SiteLoaderMount } from "@/components/template/SiteLoaderMount";
import { isSupportedLocale, type SupportedLocale } from "@/i18n/locales";
import { shouldShowSiteLoader } from "@/lib/template/shouldShowSiteLoader";

function resolveLoaderLocale(value: string | null): SupportedLocale {
  if (value && isSupportedLocale(value)) return value;
  return "fr";
}

export async function ConditionalSiteLoader() {
  if (!(await shouldShowSiteLoader())) return null;

  const locale = resolveLoaderLocale((await headers()).get("x-igm-locale"));
  return <SiteLoaderMount locale={locale} />;
}
