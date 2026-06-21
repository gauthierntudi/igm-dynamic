export type CmsSiteSettings = {
  siteName?: string;
  phoneVert?: string;
  email?: string;
  address?: string;
  footerText?: string;
  logo?: CmsMedia | string | null;
};

export type CmsMedia = {
  id?: string;
  url?: string | null;
  filename?: string | null;
  alt?: string | null;
};

export type CmsPage = {
  id: string;
  slug: string;
  title: string;
  hero?: {
    eyebrow?: string | null;
    title?: string | null;
    lead?: string | null;
    ctaLabel?: string | null;
    ctaHref?: string | null;
    media?: CmsMedia | string | null;
  };
  seoTitle?: string | null;
  seoDescription?: string | null;
};

export type CmsNews = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category?: string | null;
  publishedAt: string;
  cover?: CmsMedia | string | null;
};

export type CmsStat = {
  id: string;
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
