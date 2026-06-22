import type { SupportedLocale } from "@/i18n/locales";

export type CmsNavMenuItem = {
  id?: string | null;
  itemType?: "link" | "dropdown" | "report" | null;
  label?: string | null;
  navLink?: string | null;
  customHref?: string | null;
  openInNewTab?: boolean | null;
  cssClass?: string | null;
  nestedIcon?: "plus" | "caret" | null;
  /** Sous-menu niveau 2 */
  children?: CmsNavMenuItem[] | null;
  /** Sous-menu niveau 3 */
  subItems?: CmsNavMenuItem[] | null;
};

export type CmsFooterLink = {
  id?: string | null;
  label?: string | null;
  navLink?: string | null;
  customHref?: string | null;
  openInNewTab?: boolean | null;
};

export type CmsFooterColumn = {
  id?: string | null;
  title?: string | null;
  links?: CmsFooterLink[] | null;
};

export type CmsFooterSocial = {
  id?: string | null;
  network?: "facebook" | "linkedin" | "youtube" | "instagram" | "x" | null;
  url?: string | null;
};

export type RuntimeNavItem =
  | {
      kind: "link";
      label: string;
      href: string;
      className?: string;
      openInNewTab?: boolean;
    }
  | {
      kind: "dropdown";
      label: string;
      className?: string;
      iconStyle: "plus" | "caret";
      children: RuntimeNavItem[];
    }
  | { kind: "report"; className?: string };

export type RuntimeFooterLink = {
  label: string;
  href: string;
  openInNewTab?: boolean;
};

export type RuntimeFooterColumn = {
  title: string;
  links: RuntimeFooterLink[];
};

export type SiteNavigationBundle = {
  headerNav: RuntimeNavItem[];
  footerColumns: RuntimeFooterColumn[];
  footerHqHeading: string;
  footerHqText: string;
  footerContactTitle: string;
  footerContactLead: string;
  footerContactPhone: string;
  footerContactEmail: string;
  footerSocialTitle: string;
  footerSocial: { network: string; url: string; iconClass: string }[];
  footerLegalLinks: RuntimeFooterLink[];
  footerCopyright: string;
  phoneVert: string;
  locale: SupportedLocale;
};
