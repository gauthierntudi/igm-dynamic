import { WHO_WE_ARE_USE_CMS } from "@/config/features";
import type { SupportedLocale } from "@/i18n/locales";

import { getWhoWeAre } from "../client";
import type { CmsWhoWeAre } from "./types";

/**
 * Charge le global Payload `who-we-are` pour les pages À propos / Historique / Mission.
 * Quand `WHO_WE_ARE_USE_CMS` est false, retourne null : le composant utilise le seed statique.
 * N'affecte pas header ni footer (voir `getSiteSettings` dans le layout).
 */
export async function getWhoWeArePageContent(
  locale: SupportedLocale,
): Promise<CmsWhoWeAre | null> {
  if (!WHO_WE_ARE_USE_CMS) {
    return null;
  }
  return getWhoWeAre(locale);
}
