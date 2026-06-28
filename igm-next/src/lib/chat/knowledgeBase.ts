import { unstable_cache } from "next/cache";

import {
  getHome,
  getNewsListing,
  getPageBySlug,
  getSiteSettings,
  getWhoWeAre,
  isCmsConfigured,
} from "@/lib/cms/client";
import { localePathPrefix, type SupportedLocale } from "@/i18n/locales";
import { getPayloadClient } from "@/lib/cms/payload";

import {
  collectTextFields,
  mergeTextParts,
  stripHtml,
} from "./textUtils";

export type KnowledgeChunk = {
  id: string;
  title: string;
  url: string;
  text: string;
};

function withLocalePath(locale: SupportedLocale, path: string): string {
  const prefix = localePathPrefix(locale);
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (!prefix) return normalized;
  if (normalized === "/") return prefix || "/";
  return `${prefix}${normalized}`;
}

function chunk(
  id: string,
  title: string,
  url: string,
  parts: string[],
): KnowledgeChunk | null {
  const text = mergeTextParts(parts);
  if (!text) return null;
  return { id, title, url, text };
}

async function fetchAllPages(locale: SupportedLocale) {
  if (!isCmsConfigured()) return [];
  try {
    const payload = await getPayloadClient();
    const result = await payload.find({
      collection: "pages",
      limit: 100,
      depth: 0,
      locale,
    });
    return result.docs as Array<{
      id: number;
      slug: string;
      title: string;
      summary?: string | null;
      contentHtml?: string | null;
      hero?: { title?: string | null; lead?: string | null; eyebrow?: string | null };
      seoDescription?: string | null;
    }>;
  } catch {
    return [];
  }
}

async function buildKnowledgeBaseUncached(locale: SupportedLocale): Promise<KnowledgeChunk[]> {
  const chunks: KnowledgeChunk[] = [];

  const [settings, home, whoWeAre, pages, newsListing] = await Promise.all([
    getSiteSettings(locale),
    getHome(locale),
    getWhoWeAre(locale),
    fetchAllPages(locale),
    getNewsListing(locale, { page: 1, limit: 24 }),
  ]);

  const contactParts: string[] = [];
  if (settings?.siteName) contactParts.push(`Nom du site : ${settings.siteName}`);
  if (settings?.phoneVert) contactParts.push(`Téléphone : ${settings.phoneVert}`);
  if (settings?.email) contactParts.push(`E-mail : ${settings.email}`);
  if (settings?.address) contactParts.push(`Adresse : ${settings.address}`);
  if (settings?.footerContactLead) contactParts.push(settings.footerContactLead);
  if (settings?.footerHqText) contactParts.push(settings.footerHqText);

  const contactChunk = chunk(
    "contact",
    locale === "fr" ? "Contact IGM" : "IGM contact",
    withLocalePath(locale, "/"),
    contactParts,
  );
  if (contactChunk) chunks.push(contactChunk);

  if (home) {
    const homeParts: string[] = [];
    collectTextFields(home.banner, homeParts);
    collectTextFields(home.about, homeParts);
    collectTextFields(home.strategy, homeParts);
    collectTextFields(home.action, homeParts);
    collectTextFields(home.orgChart, homeParts);
    collectTextFields(home.contact, homeParts);
    collectTextFields(home.partners, homeParts);
    collectTextFields(home.newsSection, homeParts);

    const homeChunk = chunk(
      "home",
      locale === "fr" ? "Accueil IGM" : "IGM home",
      withLocalePath(locale, "/"),
      homeParts,
    );
    if (homeChunk) chunks.push(homeChunk);
  }

  if (whoWeAre) {
    const wwaParts: string[] = [];
    if (whoWeAre.headline) wwaParts.push(whoWeAre.headline);
    if (whoWeAre.intro) wwaParts.push(whoWeAre.intro);
    collectTextFields(whoWeAre.aboutSection, wwaParts);
    collectTextFields(whoWeAre.historySection, wwaParts);
    collectTextFields(whoWeAre.missionSection, wwaParts);
    collectTextFields(whoWeAre.teamSection, wwaParts);
    collectTextFields(whoWeAre.statsSection, wwaParts);

    const wwaChunk = chunk(
      "who-we-are",
      locale === "fr" ? "Qui sommes-nous" : "Who we are",
      withLocalePath(locale, locale === "fr" ? "/a-propos" : "/about"),
      wwaParts,
    );
    if (wwaChunk) chunks.push(wwaChunk);
  }

  for (const page of pages) {
    const parts: string[] = [];
    if (page.title) parts.push(page.title);
    if (page.summary) parts.push(page.summary);
    if (page.seoDescription) parts.push(page.seoDescription);
    if (page.hero?.eyebrow) parts.push(page.hero.eyebrow);
    if (page.hero?.title) parts.push(page.hero.title);
    if (page.hero?.lead) parts.push(page.hero.lead);
    if (page.contentHtml) parts.push(stripHtml(page.contentHtml));

    const pageChunk = chunk(
      `page-${page.slug}`,
      page.title,
      withLocalePath(locale, `/${page.slug}`),
      parts,
    );
    if (pageChunk) chunks.push(pageChunk);
  }

  for (const article of newsListing.docs) {
    const parts: string[] = [article.title, article.excerpt];
    if (article.categoryCustom) parts.push(article.categoryCustom);
    if (article.contentHtml) parts.push(stripHtml(article.contentHtml));

    const newsChunk = chunk(
      `news-${article.slug}`,
      article.title,
      withLocalePath(locale, `/actualites/${article.slug}`),
      parts,
    );
    if (newsChunk) chunks.push(newsChunk);
  }

  chunks.push({
    id: "signalement",
    title: locale === "fr" ? "Signalement / Dénoncer" : "Report / Whistleblowing",
    url: withLocalePath(locale, "/denoncer"),
    text:
      locale === "fr"
        ? "Vous pouvez transmettre un signalement via la page Dénoncer ou le bouton Signalement sur le site. Les signalements peuvent être anonymes. Joignez des photos, audios ou documents si nécessaire."
        : "You can submit a report via the Report page or the Report button on the site. Reports can be anonymous. Attach photos, audio or documents if needed.",
  });

  chunks.push({
    id: "cartographie",
    title: locale === "fr" ? "Cartographie minière" : "Mining map",
    url: withLocalePath(locale, "/cartographie"),
    text:
      locale === "fr"
        ? "La cartographie interactive présente les activités minières en République Démocratique du Congo, par province et site."
        : "The interactive map shows mining activities in the Democratic Republic of Congo, by province and site.",
  });

  // Pages statiques connues si absentes du CMS
  const cartographiePage = await getPageBySlug("cartographie", locale);
  if (cartographiePage) {
    const parts: string[] = [];
    if (cartographiePage.summary) parts.push(cartographiePage.summary);
    if (cartographiePage.contentHtml) parts.push(stripHtml(cartographiePage.contentHtml));
    const c = chunk(
      "cartographie-cms",
      cartographiePage.title,
      withLocalePath(locale, "/cartographie"),
      parts,
    );
    if (c) chunks.push(c);
  }

  return chunks;
}

const knowledgeCacheByLocale = {
  fr: unstable_cache(() => buildKnowledgeBaseUncached("fr"), ["chat-knowledge", "fr"], {
    tags: ["chat:knowledge", "chat:knowledge:fr"],
  }),
  en: unstable_cache(() => buildKnowledgeBaseUncached("en"), ["chat-knowledge", "en"], {
    tags: ["chat:knowledge", "chat:knowledge:en"],
  }),
} satisfies Record<SupportedLocale, () => Promise<KnowledgeChunk[]>>;

export async function getKnowledgeBase(locale: SupportedLocale): Promise<KnowledgeChunk[]> {
  if (!isCmsConfigured()) return [];
  if (process.env.NODE_ENV === "development") {
    return buildKnowledgeBaseUncached(locale);
  }
  return knowledgeCacheByLocale[locale]();
}
