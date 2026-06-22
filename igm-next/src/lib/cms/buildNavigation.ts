import { getMessages } from "@/i18n/messages";
import { MAIN_NAV, type NavItem } from "@/i18n/navigation";
import type { SupportedLocale } from "@/i18n/locales";
import { hrefForRoute } from "@/i18n/paths";

import type {
  CmsFooterColumn,
  CmsFooterLink,
  CmsFooterSocial,
  CmsNavMenuItem,
  RuntimeFooterColumn,
  RuntimeFooterLink,
  RuntimeNavItem,
  SiteNavigationBundle,
} from "./navigationTypes";
import { resolveNavMenuHref } from "./resolveNavMenuLink";
import type { CmsSiteSettings } from "./types";

const SOCIAL_ICONS: Record<string, string> = {
  facebook: "bi-facebook",
  linkedin: "bi-linkedin",
  youtube: "bi-youtube",
  instagram: "bi-instagram",
  x: "bi-twitter-x",
};

function cmsNavItemToRuntime(
  item: CmsNavMenuItem,
  locale: SupportedLocale,
  level: 1 | 2 | 3 = 1,
): RuntimeNavItem | null {
  const label = item.label?.trim();
  if (!label) return null;

  if (item.itemType === "report") {
    return { kind: "report", className: item.cssClass ?? undefined };
  }

  if (item.itemType === "dropdown") {
    const nested = level === 1 ? item.children : item.subItems;
    const childLevel = level === 1 ? 2 : 3;
    const children =
      nested
        ?.map((child) => cmsNavItemToRuntime(child, locale, childLevel))
        .filter((c): c is RuntimeNavItem => c !== null) ?? [];

    if (!children.length) return null;

    return {
      kind: "dropdown",
      label,
      className: item.cssClass ?? undefined,
      iconStyle: item.nestedIcon === "caret" ? "caret" : "plus",
      children,
    };
  }

  return {
    kind: "link",
    label,
    href: resolveNavMenuHref(item, locale),
    className: item.cssClass ?? undefined,
    openInNewTab: item.openInNewTab ?? undefined,
  };
}

function defaultNavItemToRuntime(item: NavItem, locale: SupportedLocale): RuntimeNavItem {
  const messages = getMessages(locale);

  if (item.kind === "denounce") {
    return { kind: "report", className: item.className };
  }

  if (item.kind === "route") {
    const labelKey = item.labelKey ?? "home";
    return {
      kind: "link",
      label: messages.nav[labelKey],
      href: hrefForRoute(item.routeKey, locale),
      className: item.className,
    };
  }

  return {
    kind: "dropdown",
    label: messages.nav[item.labelKey],
    className: item.className,
    iconStyle: item.labelKey === "whoWeAre" ? "caret" : "plus",
    children: item.items.map((child) => defaultNavItemToRuntime(child, locale)),
  };
}

function buildDefaultHeaderNav(locale: SupportedLocale): RuntimeNavItem[] {
  return MAIN_NAV.map((item) => defaultNavItemToRuntime(item, locale));
}

function cmsFooterLinkToRuntime(link: CmsFooterLink, locale: SupportedLocale): RuntimeFooterLink | null {
  const label = link.label?.trim();
  if (!label) return null;

  return {
    label,
    href: resolveNavMenuHref(link, locale),
    openInNewTab: link.openInNewTab ?? undefined,
  };
}

function buildDefaultFooterColumns(locale: SupportedLocale): RuntimeFooterColumn[] {
  const f = getMessages(locale).footer;

  const organs: RuntimeFooterLink[] = [
    { label: "Ministère des Mines", href: "https://mines.gouv.cd/fr/", openInNewTab: true },
    { label: "Secrétariat des Mines", href: "https://sg-mines-rdc.cd/", openInNewTab: true },
    { label: "CAMI", href: "https://cami.cd/", openInNewTab: true },
    { label: "CTCPM", href: "https://ctcpm.cd/fr/", openInNewTab: true },
    { label: "CEEC", href: "https://ceec.cd/", openInNewTab: true },
    { label: "SAEMAPE", href: "https://saemape.cd/", openInNewTab: true },
    { label: "SGNC", href: "https://sgnc.cd/", openInNewTab: true },
    { label: "FOMIN", href: "https://www.fomin.cd/", openInNewTab: true },
    { label: "ARECOMS", href: "#!", openInNewTab: true },
  ];

  const useful: RuntimeFooterLink[] = [
    { label: "Présidence", href: "https://presidence.cd/", openInNewTab: true },
    { label: "Primature", href: "https://www.primature.gouv.cd/", openInNewTab: true },
    { label: "CNLFM", href: "#!", openInNewTab: true },
    { label: "CENAREF", href: "https://www.cenaref.org/", openInNewTab: true },
    { label: "INTERPOL", href: "https://www.interpol.int/fr", openInNewTab: true },
    { label: "CAMI", href: "https://cami.cd/", openInNewTab: true },
    { label: "CEEC", href: "https://ceec.cd/", openInNewTab: true },
    { label: "DGDA", href: "https://douane.gouv.cd/", openInNewTab: true },
  ];

  return [
    { title: f.organs, links: organs },
    { title: f.usefulLinks, links: useful },
  ];
}

function cmsFooterColumnsToRuntime(
  columns: CmsFooterColumn[] | null | undefined,
  locale: SupportedLocale,
): RuntimeFooterColumn[] {
  if (!columns?.length) return buildDefaultFooterColumns(locale);

  return columns
    .map((col) => {
      const title = col.title?.trim();
      const links =
        col.links
          ?.map((link) => cmsFooterLinkToRuntime(link, locale))
          .filter((l): l is RuntimeFooterLink => l !== null) ?? [];

      if (!title || !links.length) return null;
      return { title, links };
    })
    .filter((c): c is RuntimeFooterColumn => c !== null);
}

const DEFAULT_HQ_FR =
  "N°4808, Avenue Tabu Ley (Ex-Tombalbaye) Quartier Golf /\nCommune de Gombe\nVille de Kinshasa\n(Réf. : Eglise Notre Dame de Fatima)";

const DEFAULT_HQ_EN =
  "No. 4808, Avenue Tabu Ley (Ex-Tombalbaye) Golf District /\nGombe Commune\nKinshasa\n(Ref.: Notre Dame de Fatima Church)";

const DEFAULT_SOCIAL: CmsFooterSocial[] = [
  { network: "facebook", url: "https://www.facebook.com/" },
  { network: "linkedin", url: "https://www.linkedin.com/" },
  { network: "youtube", url: "https://www.youtube.com/" },
  { network: "instagram", url: "https://www.instagram.com/" },
  { network: "x", url: "https://www.x.com/" },
];

export function buildSiteNavigation(
  settings: CmsSiteSettings | null | undefined,
  locale: SupportedLocale,
): SiteNavigationBundle {
  const messages = getMessages(locale);
  const f = messages.footer;

  const headerNav =
    settings?.headerNav?.length
      ? settings.headerNav
          .map((item) => cmsNavItemToRuntime(item, locale))
          .filter((item): item is RuntimeNavItem => item !== null)
      : buildDefaultHeaderNav(locale);

  const footerColumns = cmsFooterColumnsToRuntime(settings?.footerColumns, locale);

  const footerSocial =
    settings?.footerSocial?.length
      ? settings.footerSocial
          .filter((s) => s.network && s.url?.trim())
          .map((s) => ({
            network: s.network!,
            url: s.url!.trim(),
            iconClass: SOCIAL_ICONS[s.network!] ?? "bi-link",
          }))
      : DEFAULT_SOCIAL.filter((s) => s.network && s.url).map((s) => ({
          network: s.network!,
          url: s.url!,
          iconClass: SOCIAL_ICONS[s.network!] ?? "bi-link",
        }));

  const footerLegalLinks =
    settings?.footerLegalLinks?.length
      ? settings.footerLegalLinks
          .map((link) => cmsFooterLinkToRuntime(link, locale))
          .filter((l): l is RuntimeFooterLink => l !== null)
      : [
          { label: f.terms, href: "#" },
          { label: f.cookies, href: "#" },
        ];

  return {
    locale,
    headerNav,
    footerColumns,
    footerHqHeading: settings?.footerHqHeading?.trim() || f.hqAddress,
    footerHqText:
      settings?.footerHqText?.trim() ||
      (locale === "en" ? DEFAULT_HQ_EN : DEFAULT_HQ_FR),
    footerContactTitle: settings?.footerContactTitle?.trim() || f.contactTitle,
    footerContactLead: settings?.footerContactLead?.trim() || f.contactLead,
    footerContactPhone: settings?.footerContactPhone?.trim() || "+243 900 030 005",
    footerContactEmail: settings?.footerContactEmail?.trim() || settings?.email?.trim() || "info@igm.cd",
    footerSocialTitle: settings?.footerSocialTitle?.trim() || f.social,
    footerSocial,
    footerLegalLinks,
    footerCopyright: settings?.footerCopyright?.trim() || `${f.copyright} IGM | ${f.rights}`,
    phoneVert: settings?.phoneVert?.trim() || "+243 97 684 4563",
  };
}
