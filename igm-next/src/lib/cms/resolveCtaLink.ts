import { CUSTOM_NAV_LINK_VALUE } from "@/lib/siteNavLinks";

import { localizeHref } from "@/i18n/paths";
import type { SupportedLocale } from "@/i18n/locales";

import type { CmsHomeCta } from "./home/types";

/** Résout l’URL d’un bouton bannière (menu, URL perso ou ancien champ href). */
export function resolveBannerCtaHref(
  cta: CmsHomeCta | null | undefined,
  locale?: SupportedLocale,
): string {
  if (!cta) return "#";

  if (cta.navLink === CUSTOM_NAV_LINK_VALUE) {
    const custom = cta.customHref?.trim() || "#";
    return locale ? localizeHref(custom, locale) : custom;
  }

  if (cta.navLink?.trim()) {
    const link = cta.navLink.trim();
    return locale ? localizeHref(link, locale) : link;
  }

  const legacy = cta.href?.trim() || "#";
  return locale ? localizeHref(legacy, locale) : legacy;
}
