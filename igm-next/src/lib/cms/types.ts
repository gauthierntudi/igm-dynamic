export type CmsSiteSettings = {
  siteName?: string;
  phoneVert?: string;
  email?: string;
  address?: string;
  footerText?: string;
  logo?: CmsMedia | string | null;
  headerNav?: import("./navigationTypes").CmsNavMenuItem[] | null;
  footerHqHeading?: string | null;
  footerHqText?: string | null;
  footerColumns?: import("./navigationTypes").CmsFooterColumn[] | null;
  footerContactTitle?: string | null;
  footerContactLead?: string | null;
  footerContactPhone?: string | null;
  footerContactEmail?: string | null;
  footerSocialTitle?: string | null;
  footerSocial?: import("./navigationTypes").CmsFooterSocial[] | null;
  footerLegalLinks?: import("./navigationTypes").CmsFooterLink[] | null;
  footerCopyright?: string | null;
};

export type CmsMedia = {
  id?: string;
  url?: string | null;
  filename?: string | null;
  alt?: string | null;
};

export type CmsPage = {
  id: number;
  slug: string;
  title: string;
  summary?: string | null;
  hero?: {
    eyebrow?: string | null;
    title?: string | null;
    lead?: string | null;
    ctaLabel?: string | null;
    ctaHref?: string | null;
    media?: CmsMedia | string | number | null;
  };
  content?: unknown;
  contentHtml?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
};

export type CmsNews = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  category?: string | null;
  publishedAt: string;
  cover?: CmsMedia | string | null;
};

export type CmsStat = {
  id: number;
  key: string;
  label: string;
  value: number;
  suffix?: string | null;
  order?: number | null;
};

export type CmsListResponse<T> = {
  docs: T[];
  totalDocs: number;
  limit: number;
  totalPages: number;
  page: number;
  pagingCounter: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  prevPage: number | null;
  nextPage: number | null;
};

export type CmsGlobalResponse<T> = T;
