import type { CmsMedia, CmsNews } from "../types";
import type { SupportedLocale } from "@/i18n/locales";

export type CmsHomeCta = {
  label?: string | null;
  /** @deprecated Ancien champ texte — conservé pour compatibilité. */
  href?: string | null;
  navLink?: string | null;
  customHref?: string | null;
};

export type CmsHomeBannerSlide = {
  slideType?: "image" | "video" | null;
  image?: CmsMedia | number | null;
  video?: CmsMedia | number | null;
  badge?: string | null;
  title: string;
  lead?: string | null;
  features?: { label?: string | null; id?: string | null }[] | null;
  primaryCta?: CmsHomeCta | null;
  secondaryCta?: CmsHomeCta | null;
};

export type CmsHomeAbout = {
  title?: string | null;
  mission?: { title?: string | null; text?: string | null; href?: string | null } | null;
  vision?: { title?: string | null; text?: string | null; href?: string | null } | null;
  leadText?: string | null;
  detailText?: string | null;
  signatureName?: string | null;
  signatureRole?: string | null;
  image?: CmsMedia | number | null;
};

export type CmsHomeStrategy = {
  video?: CmsMedia | number | null;
  title?: string | null;
  lead?: string | null;
  ambitions?: { label?: string | null; id?: string | null }[] | null;
  axesTitle?: string | null;
  axes?: {
    label?: string | null;
    /** @deprecated Ancien format highlight + text */
    highlight?: string | null;
    text?: string | null;
    id?: string | null;
  }[] | null;
  ctaLabel?: string | null;
  ctaHref?: string | null;
};

export type CmsHomeStatsSection = {
  title?: string | null;
  lead?: string | null;
};

export type CmsHomePartner = {
  name: string;
  logo?: CmsMedia | number | null;
  logoDark?: CmsMedia | number | null;
  url?: string | null;
  id?: string | null;
};

export type CmsHomePartnersSection = {
  title?: string | null;
  partners?: CmsHomePartner[] | null;
};

export type CmsHomeActionItem = {
  title?: string | null;
  text?: string | null;
  id?: string | null;
};

export type CmsHomeActionSection = {
  titlePrefix?: string | null;
  titleHighlight?: string | null;
  titleSuffix?: string | null;
  lead?: string | null;
  items?: CmsHomeActionItem[] | null;
  ctaLead?: string | null;
  ctaLabel?: string | null;
  ctaHref?: string | null;
};

export type CmsHomeOrgChartUnit = {
  name?: string | null;
  role?: string | null;
  image?: CmsMedia | number | null;
  id?: string | null;
};

export type CmsHomeOrgChartSection = {
  titlePrefix?: string | null;
  titleHighlight?: string | null;
  titleSuffix?: string | null;
  lead?: string | null;
  diagram?: CmsMedia | number | null;
  units?: CmsHomeOrgChartUnit[] | null;
  ctaSidebarTitle?: string | null;
  ctaLabel?: string | null;
  ctaHref?: string | null;
};

export type CmsHomeNewsSection = {
  title?: string | null;
  lead?: string | null;
  maxItems?: number | null;
};

export type CmsHomeContactMediaItem = {
  id?: string | null;
  kind?: "image" | "video" | null;
  image?: CmsMedia | number | null;
  video?: CmsMedia | number | null;
  displayWidth?: number | null;
  alt?: string | null;
};

export type CmsHomeContactSection = {
  title?: string | null;
  lead?: string | null;
  buttonLabel?: string | null;
  buttonHref?: string | null;
  gallery?: CmsHomeContactMediaItem[] | null;
};

export type CmsHome = {
  seoTitle?: string | null;
  seoDescription?: string | null;
  bannerSlides?: CmsHomeBannerSlide[] | null;
  about?: CmsHomeAbout | null;
  strategy?: CmsHomeStrategy | null;
  statsSection?: CmsHomeStatsSection | null;
  partnersSection?: CmsHomePartnersSection | null;
  actionSection?: CmsHomeActionSection | null;
  orgChartSection?: CmsHomeOrgChartSection | null;
  newsSection?: CmsHomeNewsSection | null;
  contactSection?: CmsHomeContactSection | null;
};

export type HomeRenderContext = {
  home: CmsHome;
  news: CmsNews[];
  locale?: SupportedLocale;
};
