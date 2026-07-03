import { getMessages } from "@/i18n/messages";
import { MAIN_NAV, type NavItem } from "@/i18n/navigation";
import type { RouteKey } from "@/i18n/paths";
import { ROUTE_KEYS } from "@/i18n/paths";
import { CUSTOM_NAV_LINK_VALUE } from "@/lib/siteNavLinks";

type LocalizedText = { fr: string; en: string };

export type SeedNavItem = {
  itemType: "link" | "dropdown" | "report";
  label: LocalizedText;
  navLink?: string;
  customHref?: string;
  cssClass?: string;
  nestedIcon?: "plus" | "caret";
  openInNewTab?: boolean;
  children?: SeedNavItem[];
  subItems?: SeedNavItem[];
};

export type SeedFooterLink = {
  label: LocalizedText;
  navLink?: string;
  customHref?: string;
  openInNewTab?: boolean;
};

export type SeedFooterColumn = {
  title: LocalizedText;
  links: SeedFooterLink[];
};

export type DefaultSiteSettingsSeed = {
  siteName: LocalizedText;
  phoneVert: string;
  email: string;
  headerNav: SeedNavItem[];
  footerHqHeading: LocalizedText;
  footerHqText: LocalizedText;
  footerColumns: SeedFooterColumn[];
  footerContactTitle: LocalizedText;
  footerContactLead: LocalizedText;
  footerContactPhone: string;
  footerContactEmail: string;
  footerSocialTitle: LocalizedText;
  footerSocial: { network: "facebook" | "linkedin" | "youtube" | "instagram" | "x"; url: string }[];
  footerLegalLinks: SeedFooterLink[];
  footerCopyright: LocalizedText;
};

const fr = getMessages("fr");
const en = getMessages("en");

function navLabel(labelKey: keyof typeof fr.nav): LocalizedText {
  return { fr: fr.nav[labelKey], en: en.nav[labelKey] };
}

function routeNavLink(routeKey: RouteKey): string {
  const slug = ROUTE_KEYS[routeKey].fr;
  return slug ? `/${slug}` : "/";
}

function navItemToSeed(item: NavItem, depth: 1 | 2): SeedNavItem {
  if (item.kind === "denounce") {
    return {
      itemType: "report",
      label: navLabel("report"),
      cssClass: item.className,
    };
  }

  if (item.kind === "route") {
    const labelKey = item.labelKey ?? "home";
    return {
      itemType: "link",
      label: navLabel(labelKey),
      navLink: routeNavLink(item.routeKey),
      cssClass: item.className,
    };
  }

  const base: SeedNavItem = {
    itemType: "dropdown",
    label: navLabel(item.labelKey),
    cssClass: item.className,
    nestedIcon: item.labelKey === "whoWeAre" ? "caret" : "plus",
  };

  if (depth === 1) {
    return {
      ...base,
      children: item.items.map((child) => navItemToSeed(child, 2)),
    };
  }

  return {
    ...base,
    subItems: item.items.map((child) => navItemToSeed(child, 2)),
  };
}

function externalLink(label: string, href: string): SeedFooterLink {
  return {
    label: { fr: label, en: label },
    navLink: CUSTOM_NAV_LINK_VALUE,
    customHref: href,
    openInNewTab: true,
  };
}

const DEFAULT_HQ_FR =
  "N°4808, Avenue Tabu Ley (Ex-Tombalbaye) Quartier Golf /\nCommune de Gombe\nVille de Kinshasa\n(Réf. : Eglise Notre Dame de Fatima)";

const DEFAULT_HQ_EN =
  "No. 4808, Avenue Tabu Ley (Ex-Tombalbaye) Golf District /\nGombe Commune\nKinshasa\n(Ref.: Notre Dame de Fatima Church)";

/** Menu header + pied de page alignés sur `MAIN_NAV` et les fallbacks du template. */
export function buildDefaultSiteSettingsSeed(): DefaultSiteSettingsSeed {
  return {
    siteName: { fr: "IGM", en: "IGM" },
    phoneVert: "+243 97 684 4563",
    email: "info@igm.cd",
    headerNav: MAIN_NAV.map((item) => navItemToSeed(item, 1)),
    footerHqHeading: { fr: fr.footer.hqAddress, en: en.footer.hqAddress },
    footerHqText: { fr: DEFAULT_HQ_FR, en: DEFAULT_HQ_EN },
    footerColumns: [
      {
        title: { fr: fr.footer.organs, en: en.footer.organs },
        links: [
          externalLink("Ministère des Mines", "https://mines.gouv.cd/fr/"),
          externalLink("Secrétariat des Mines", "https://sg-mines-rdc.cd/"),
          externalLink("CAMI", "https://cami.cd/"),
          externalLink("CTCPM", "https://ctcpm.cd/fr/"),
          externalLink("CEEC", "https://ceec.cd/"),
          externalLink("SAEMAPE", "https://saemape.cd/"),
          externalLink("SGNC", "https://sgnc.cd/"),
          externalLink("FOMIN", "https://www.fomin.cd/"),
          externalLink("ARECOMS", "#!"),
        ],
      },
      {
        title: { fr: fr.footer.usefulLinks, en: en.footer.usefulLinks },
        links: [
          externalLink("Présidence", "https://presidence.cd/"),
          externalLink("Primature", "https://www.primature.gouv.cd/"),
          externalLink("CNLFM", "#!"),
          externalLink("CENAREF", "https://www.cenaref.org/"),
          externalLink("INTERPOL", "https://www.interpol.int/fr"),
          externalLink("CAMI", "https://cami.cd/"),
          externalLink("CEEC", "https://ceec.cd/"),
          externalLink("DGDA", "https://douane.gouv.cd/"),
        ],
      },
    ],
    footerContactTitle: { fr: fr.footer.contactTitle, en: en.footer.contactTitle },
    footerContactLead: { fr: fr.footer.contactLead, en: en.footer.contactLead },
    footerContactPhone: "+243 900 030 005",
    footerContactEmail: "info@igm.cd",
    footerSocialTitle: { fr: fr.footer.social, en: en.footer.social },
    footerSocial: [
      { network: "facebook", url: "https://www.facebook.com/" },
      { network: "linkedin", url: "https://www.linkedin.com/" },
      { network: "youtube", url: "https://www.youtube.com/" },
      { network: "instagram", url: "https://www.instagram.com/" },
      { network: "x", url: "https://www.x.com/" },
    ],
    footerLegalLinks: [
      {
        label: { fr: fr.footer.terms, en: en.footer.terms },
        navLink: CUSTOM_NAV_LINK_VALUE,
        customHref: "/conditions-generales",
      },
      {
        label: { fr: fr.footer.cookies, en: en.footer.cookies },
        navLink: CUSTOM_NAV_LINK_VALUE,
        customHref: "/politique-cookies",
      },
    ],
    footerCopyright: {
      fr: `${fr.footer.copyright} IGM | ${fr.footer.rights}`,
      en: `${en.footer.copyright} IGM | ${en.footer.rights}`,
    },
  };
}
