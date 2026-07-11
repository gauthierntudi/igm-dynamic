import { mediaUrl } from "@/lib/cdnUrl";
import { withDeployedBase } from "@/lib/deployBasePath";
import type { SupportedLocale } from "@/i18n/locales";
import type { WhoWeAreSectionId } from "@/i18n/paths";
import { resolveBannerCtaHref } from "@/lib/cms/resolveCtaLink";

import {
  DEFAULT_WHO_WE_ARE_EN,
  DEFAULT_WHO_WE_ARE_FR,
} from "../defaultWhoWeAreSeed";
import type {
  CmsWhoWeAre,
  CmsWhoWeAreLabelItem,
  CmsWhoWeAreStat,
  CmsWhoWeAreTeamMember,
} from "./types";
import type { CmsMedia } from "../types";

export type ResolvedWhoWeArePage = {
  seoTitle: string;
  seoDescription: string;
  heroTitle: string;
  headline: string;
  intro: string;
  heroImageSrc: string;
  heroImageAlt: string;
  nav: Record<WhoWeAreSectionId, string>;
  about: {
    title?: string;
    paragraphs: string[];
    imageSrc: string;
    imageAlt: string;
    quote?: {
      text: string;
      authorName: string;
      authorRole: string;
      authorPhotoSrc: string;
      authorPhotoAlt: string;
    };
  };
  history: {
    title?: string;
    lead: string;
    headline: string;
    paragraphs: string[];
    heroImageSrc: string;
    ctaImageSrc: string;
    teaserImages: Array<{ src: string; alt: string }>;
  };
  mission: {
    title?: string;
    lead?: string;
    headline?: string;
    paragraphs: string[];
    statutoryTitle?: string;
    statutoryItems: string[];
    prioritiesTitle?: string;
    priorities: string[];
  };
  stats: CmsWhoWeAreStat[];
  team: {
    title?: string;
    lead: string;
    members: Array<{
      name: string;
      role: string;
      photoSrc: string;
      photoAlt: string;
    }>;
  };
  cta: {
    title?: string;
    text: string;
    href: string;
    label: string;
  };
  contact: {
    title?: string;
    lead: string;
    primaryHref: string;
    primaryLabel: string;
    phoneHref: string;
    phoneLabel: string;
    imageSrc: string;
    imageAlt: string;
  };
};

function defaultForLocale(locale: SupportedLocale): CmsWhoWeAre {
  return locale === "en" ? DEFAULT_WHO_WE_ARE_EN : DEFAULT_WHO_WE_ARE_FR;
}

function splitParagraphs(text: string | null | undefined): string[] {
  if (!text?.trim()) return [];
  return text
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function resolveMediaSrc(
  media: CmsMedia | number | null | undefined,
  fallback: string,
): string {
  if (media && typeof media === "object") {
    const url = mediaUrl(media);
    if (url) {
      if (/^https?:\/\//i.test(url)) return url;
      const normalized = url.startsWith("/") ? url : `/${url}`;
      return withDeployedBase(normalized);
    }
  }
  return withDeployedBase(fallback);
}

function resolveMediaAlt(
  media: CmsMedia | number | null | undefined,
  fallback: string,
): string {
  if (media && typeof media === "object" && media.alt?.trim()) {
    return media.alt.trim();
  }
  return fallback;
}

function resolveLabels(items: CmsWhoWeAreLabelItem[] | null | undefined): string[] {
  return items?.map((item) => item.label?.trim()).filter(Boolean) as string[] ?? [];
}

function pickText(value: string | null | undefined, fallback: string): string {
  return value?.trim() || fallback;
}

/** Texte optionnel : vide en CMS = pas d'affichage ; hors CMS, repli sur le seed. */
function resolveOptionalCmsText(
  cms: CmsWhoWeAre | null | undefined,
  rawValue: string | null | undefined,
  fallback: string,
): string | undefined {
  if (!cms) {
    return fallback.trim() || undefined;
  }
  return rawValue?.trim() || undefined;
}

function resolveOptionalParagraphs(
  cms: CmsWhoWeAre | null | undefined,
  rawBody: string | null | undefined,
  fallbackBody: string | null | undefined,
): string[] {
  if (!cms) {
    return splitParagraphs(fallbackBody);
  }
  return splitParagraphs(rawBody);
}

function mergeWhoWeAre(
  cms: CmsWhoWeAre | null | undefined,
  locale: SupportedLocale,
): CmsWhoWeAre {
  const defaults = defaultForLocale(locale);
  if (!cms) return defaults;

  return {
    ...defaults,
    ...cms,
    aboutSection: {
      ...defaults.aboutSection,
      ...cms.aboutSection,
      quote: {
        ...defaults.aboutSection?.quote,
        ...cms.aboutSection?.quote,
      },
    },
    historySection: {
      ...defaults.historySection,
      ...cms.historySection,
    },
    missionSection: {
      ...defaults.missionSection,
      ...cms.missionSection,
      statutoryItems:
        cms.missionSection?.statutoryItems?.length
          ? cms.missionSection.statutoryItems
          : defaults.missionSection?.statutoryItems,
      priorities:
        cms.missionSection?.priorities?.length
          ? cms.missionSection.priorities
          : defaults.missionSection?.priorities,
    },
    statsSection: {
      items:
        cms.statsSection?.items?.length
          ? cms.statsSection.items
          : defaults.statsSection?.items,
    },
    teamSection: {
      ...defaults.teamSection,
      ...cms.teamSection,
      members:
        cms.teamSection?.members?.length
          ? cms.teamSection.members
          : defaults.teamSection?.members,
    },
    ctaSection: {
      ...defaults.ctaSection,
      ...cms.ctaSection,
      link: { ...defaults.ctaSection?.link, ...cms.ctaSection?.link },
    },
    contactSection: {
      ...defaults.contactSection,
      ...cms.contactSection,
      primaryCta: {
        ...defaults.contactSection?.primaryCta,
        ...cms.contactSection?.primaryCta,
      },
    },
  };
}

export function resolveWhoWeArePage(
  cms: CmsWhoWeAre | null | undefined,
  locale: SupportedLocale,
): ResolvedWhoWeArePage {
  const data = mergeWhoWeAre(cms, locale);
  const defaults = defaultForLocale(locale);

  const quote = data.aboutSection?.quote;
  const quoteText = quote?.text?.trim();
  const quoteAuthor = quote?.authorName?.trim();
  const quoteRole = quote?.authorRole?.trim();

  const ctaHref = resolveBannerCtaHref(data.ctaSection?.link, locale) || hrefForContact(locale);
  const contactPrimaryHref =
    resolveBannerCtaHref(data.contactSection?.primaryCta, locale) || hrefForContact(locale);

  return {
    seoTitle: pickText(data.seoTitle, defaults.seoTitle!),
    seoDescription: pickText(data.seoDescription, defaults.seoDescription!),
    heroTitle: pickText(data.heroTitle, defaults.heroTitle!),
    headline: pickText(data.headline, defaults.headline!),
    intro: pickText(data.intro, defaults.intro!),
    heroImageSrc: resolveMediaSrc(data.heroImage, "/assets/img/img-07.jpg"),
    heroImageAlt: resolveMediaAlt(data.heroImage, "IGM"),
    nav: {
      about: pickText(data.navAboutLabel, defaults.navAboutLabel!),
      history: pickText(data.navHistoryLabel, defaults.navHistoryLabel!),
      mission: pickText(data.navMissionLabel, defaults.navMissionLabel!),
    },
    about: {
      title: resolveOptionalCmsText(
        cms,
        cms?.aboutSection?.title,
        defaults.aboutSection!.title!,
      ),
      paragraphs: splitParagraphs(data.aboutSection?.body).length
        ? splitParagraphs(data.aboutSection?.body)
        : splitParagraphs(defaults.aboutSection?.body),
      imageSrc: resolveMediaSrc(
        data.missionSection?.image ??
          data.aboutSection?.image ??
          data.heroImage,
        "/assets/img/img-07.jpg",
      ),
      imageAlt: resolveMediaAlt(
        data.missionSection?.image ?? data.aboutSection?.image ?? data.heroImage,
        "IGM",
      ),
      quote:
        quoteText && quoteAuthor && quoteRole
          ? {
              text: quoteText,
              authorName: quoteAuthor,
              authorRole: quoteRole,
              authorPhotoSrc: resolveMediaSrc(
                quote?.authorPhoto,
                "/assets/img/img-07.jpg",
              ),
              authorPhotoAlt: resolveMediaAlt(quote?.authorPhoto, quoteAuthor),
            }
          : undefined,
    },
    history: {
      title: resolveOptionalCmsText(
        cms,
        cms?.historySection?.title,
        defaults.historySection!.title!,
      ),
      lead: pickText(data.historySection?.lead, defaults.historySection!.lead!),
      headline: pickText(
        data.historySection?.headline,
        defaults.historySection!.headline!,
      ),
      paragraphs: splitParagraphs(data.historySection?.body).length
        ? splitParagraphs(data.historySection?.body)
        : splitParagraphs(defaults.historySection?.body),
      heroImageSrc: resolveMediaSrc(
        data.historySection?.heroImage ?? data.heroImage,
        "/assets/img/img-07.jpg",
      ),
      ctaImageSrc: resolveMediaSrc(
        data.historySection?.ctaImage ??
          data.historySection?.heroImage ??
          data.heroImage,
        "/assets/img/img-07.jpg",
      ),
      teaserImages: [
        {
          src: resolveMediaSrc(data.historySection?.teaserImage1, "/assets/img/img-06.jpg"),
          alt: resolveMediaAlt(
            data.historySection?.teaserImage1,
            locale === "en" ? "IGM inspectors on site" : "Inspecteurs IGM sur le terrain",
          ),
        },
        {
          src: resolveMediaSrc(data.historySection?.teaserImage2, "/assets/img/img-07.jpg"),
          alt: resolveMediaAlt(
            data.historySection?.teaserImage2,
            locale === "en" ? "Mining operations in the DRC" : "Activités minières en RDC",
          ),
        },
      ],
    },
    mission: {
      title: resolveOptionalCmsText(
        cms,
        cms?.missionSection?.title,
        defaults.missionSection!.title!,
      ),
      lead: resolveOptionalCmsText(
        cms,
        cms?.missionSection?.lead,
        defaults.missionSection!.lead!,
      ),
      headline: resolveOptionalCmsText(
        cms,
        cms?.missionSection?.headline,
        defaults.missionSection!.headline!,
      ),
      paragraphs: resolveOptionalParagraphs(
        cms,
        cms?.missionSection?.body,
        defaults.missionSection?.body,
      ),
      statutoryTitle: resolveOptionalCmsText(
        cms,
        cms?.missionSection?.statutoryTitle,
        defaults.missionSection!.statutoryTitle!,
      ),
      statutoryItems: resolveLabels(data.missionSection?.statutoryItems),
      prioritiesTitle: resolveOptionalCmsText(
        cms,
        cms?.missionSection?.prioritiesTitle,
        defaults.missionSection!.prioritiesTitle!,
      ),
      priorities: resolveLabels(data.missionSection?.priorities),
    },
    stats: data.statsSection?.items?.filter((item) => item.label && item.value) ?? [],
    team: {
      title: resolveOptionalCmsText(
        cms,
        cms?.teamSection?.title,
        defaults.teamSection!.title!,
      ),
      lead: pickText(data.teamSection?.lead, defaults.teamSection!.lead!),
      members:
        data.teamSection?.members
          ?.filter((member) => member.name?.trim())
          .map((member: CmsWhoWeAreTeamMember) => ({
            name: member.name!.trim(),
            role: member.role?.trim() ?? "",
            photoSrc: resolveMediaSrc(member.photo, "/assets/img/img-07.jpg"),
            photoAlt: resolveMediaAlt(member.photo, member.name!.trim()),
          })) ?? [],
    },
    cta: {
      title: resolveOptionalCmsText(cms, cms?.ctaSection?.title, defaults.ctaSection!.title!),
      text: pickText(data.ctaSection?.text, defaults.ctaSection!.text!),
      label: pickText(data.ctaSection?.link?.label, defaults.ctaSection!.link!.label!),
      href: ctaHref,
    },
    contact: {
      title: resolveOptionalCmsText(
        cms,
        cms?.contactSection?.title,
        defaults.contactSection!.title!,
      ),
      lead: pickText(data.contactSection?.lead, defaults.contactSection!.lead!),
      primaryLabel: pickText(
        data.contactSection?.primaryCta?.label,
        defaults.contactSection!.primaryCta!.label!,
      ),
      primaryHref: contactPrimaryHref,
      phoneLabel: pickText(
        data.contactSection?.phoneLabel,
        defaults.contactSection!.phoneLabel!,
      ),
      phoneHref: pickText(
        data.contactSection?.phoneHref,
        defaults.contactSection!.phoneHref!,
      ),
      imageSrc: resolveMediaSrc(data.contactSection?.image, "/assets/img/img-07.jpg"),
      imageAlt: resolveMediaAlt(data.contactSection?.image, "IGM"),
    },
  };
}

function hrefForContact(locale: SupportedLocale): string {
  return locale === "en" ? "/en/contact" : "/contact";
}

export function getWhoWeAreMeta(
  cms: CmsWhoWeAre | null | undefined,
  locale: SupportedLocale,
): { title: string; description: string } {
  const page = resolveWhoWeArePage(cms, locale);
  return { title: page.seoTitle, description: page.seoDescription };
}

export function getWhoWeAreSectionMeta(
  section: WhoWeAreSectionId,
  cms: CmsWhoWeAre | null | undefined,
  locale: SupportedLocale,
): { title: string; description: string } {
  const page = resolveWhoWeArePage(cms, locale);

  if (section === "history") {
    const excerpt =
      page.history.paragraphs[0]?.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").slice(0, 155) ??
      page.seoDescription;
    return {
      title: `${page.nav.history} — IGM`,
      description: excerpt,
    };
  }

  if (section === "mission") {
    return {
      title: `${page.nav.mission} — IGM`,
      description: page.mission.lead || page.seoDescription,
    };
  }

  return getWhoWeAreMeta(cms, locale);
}
