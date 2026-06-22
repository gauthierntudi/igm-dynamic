"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";

import { buildSiteNavigation } from "@/lib/cms/buildNavigation";
import type { SiteNavigationBundle } from "@/lib/cms/navigationTypes";
import type { CmsSiteSettings } from "@/lib/cms/types";
import type { SupportedLocale } from "@/i18n/locales";

import { useLocale } from "@/components/i18n/LocaleProvider";

type SettingsByLocale = Partial<Record<SupportedLocale, CmsSiteSettings | null>>;

type SiteSettingsContextValue = {
  settingsByLocale: SettingsByLocale;
  navigation: SiteNavigationBundle;
};

const SiteSettingsContext = createContext<SiteSettingsContextValue | null>(null);

export function SiteSettingsProvider({
  children,
  settingsByLocale,
}: {
  children: ReactNode;
  settingsByLocale: SettingsByLocale;
}) {
  const { locale } = useLocale();

  const value = useMemo(() => {
    const settings = settingsByLocale[locale] ?? null;
    return {
      settingsByLocale,
      navigation: buildSiteNavigation(settings, locale),
    };
  }, [settingsByLocale, locale]);

  return (
    <SiteSettingsContext.Provider value={value}>{children}</SiteSettingsContext.Provider>
  );
}

export function useSiteNavigation(): SiteNavigationBundle {
  const ctx = useContext(SiteSettingsContext);
  const { locale } = useLocale();
  if (!ctx) {
    return buildSiteNavigation(null, locale);
  }
  return ctx.navigation;
}

export function useSiteSettingsRaw(): CmsSiteSettings | null {
  const ctx = useContext(SiteSettingsContext);
  const { locale } = useLocale();
  if (!ctx) return null;
  return ctx.settingsByLocale[locale] ?? null;
}
