import { CUSTOM_NAV_LINK_VALUE } from "@/lib/siteNavLinks";
import type { SupportedLocale } from "@/i18n/locales";
import { resolveHistoryNavHref } from "@/i18n/paths";

export type NavLinkSource = {
  navLink?: string | null;
  customHref?: string | null;
  openInNewTab?: boolean | null;
};

/** Résout l’URL d’un lien de menu (interne localisé ou URL externe). */
export function resolveNavMenuHref(
  item: NavLinkSource,
  locale: SupportedLocale,
): string {
  if (item.navLink === CUSTOM_NAV_LINK_VALUE) {
    const custom = item.customHref?.trim() || "#";
    if (/^(https?:|mailto:|tel:|#)/i.test(custom)) return custom;
    return resolveHistoryNavHref(custom, locale);
  }

  if (item.navLink?.trim()) {
    return resolveHistoryNavHref(item.navLink.trim(), locale);
  }

  const legacy = item.customHref?.trim();
  if (legacy) {
    if (/^(https?:|mailto:|tel:|#)/i.test(legacy)) return legacy;
    return resolveHistoryNavHref(legacy, locale);
  }

  return "#";
}
