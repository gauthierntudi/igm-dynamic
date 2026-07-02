import type { Metadata } from "next";

import { ContactPageView } from "@/components/contact/ContactPageView";
import { getContactPageSettings } from "@/lib/cms/contact/getContactPageSettings";
import { resolveContactPage } from "@/lib/cms/contact/resolveContactPage";
import { getSiteSettings } from "@/lib/cms/client";
import { getPageHeroesSettings } from "@/lib/cms/page-heroes/getPageHeroesSettings";
import { resolvePageHeroImage } from "@/lib/cms/page-heroes/resolvePageHero";

import { siteMeta } from "../siteMeta";
import type { SiteRoute } from "../types";

type ContactRoute = Extract<SiteRoute, { kind: "contact" }>;

export async function renderContactRoute(route: ContactRoute) {
  const { locale } = route;
  const [settings, pageHeroes, contactCms] = await Promise.all([
    getSiteSettings(locale),
    getPageHeroesSettings(locale),
    getContactPageSettings(locale),
  ]);
  const heroImageSrc = resolvePageHeroImage(pageHeroes, "contact");
  const content = resolveContactPage(contactCms, locale);
  return (
    <ContactPageView
      locale={locale}
      settings={settings}
      heroImageSrc={heroImageSrc}
      content={content}
    />
  );
}

export async function buildContactMetadata(route: ContactRoute): Promise<Metadata> {
  const { locale, pathSegments } = route;
  const contactCms = await getContactPageSettings(locale);
  const content = resolveContactPage(contactCms, locale);
  return siteMeta(locale, pathSegments, {
    title: content.seoTitle,
    description: content.seoDescription,
  });
}
