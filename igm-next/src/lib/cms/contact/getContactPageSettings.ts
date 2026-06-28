import { unstable_cache } from "next/cache";

import { DEFAULT_LOCALE, type SupportedLocale } from "@/i18n/locales";

import { getPayloadClient } from "../payload";
import type { CmsContactPage } from "./types";

function hasDatabase(): boolean {
  return Boolean(process.env.DATABASE_URI?.trim() || process.env.DATABASE_URL?.trim());
}

async function fetchContactPageSettings(
  locale: SupportedLocale,
): Promise<CmsContactPage | null> {
  if (!hasDatabase()) return null;
  try {
    const payload = await getPayloadClient();
    return (await payload.findGlobal({
      slug: "contact-page",
      locale,
    })) as CmsContactPage;
  } catch (err) {
    console.error("[cms] getContactPageSettings:", err);
    return null;
  }
}

const cacheByLocale = {
  fr: unstable_cache(() => fetchContactPageSettings("fr"), ["cms-global-contact-page", "fr"], {
    tags: ["global:contact-page", "global:contact-page:fr"],
  }),
  en: unstable_cache(() => fetchContactPageSettings("en"), ["cms-global-contact-page", "en"], {
    tags: ["global:contact-page", "global:contact-page:en"],
  }),
} satisfies Record<SupportedLocale, () => Promise<CmsContactPage | null>>;

export async function getContactPageSettings(
  locale: SupportedLocale = DEFAULT_LOCALE,
): Promise<CmsContactPage | null> {
  if (process.env.NODE_ENV === "development") {
    return fetchContactPageSettings(locale);
  }
  return cacheByLocale[locale]();
}
