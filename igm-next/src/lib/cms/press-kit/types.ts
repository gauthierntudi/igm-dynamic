import type { CmsMedia } from "../types";

export type CmsPressKitPage = {
  seoTitle?: string | null;
  seoDescription?: string | null;
  heroTitle?: string | null;
  heroLead?: string | null;
  intro?: string | null;
  downloadLabel?: string | null;
  presentationPdf?: CmsMedia | number | null;
};

export type ResolvedPressKitPage = {
  seoTitle: string;
  seoDescription: string;
  heroTitle: string;
  heroLead: string;
  intro: string;
  downloadLabel: string;
  pdfTitle: string;
  pdfViewUrl: string;
  pdfDownloadUrl: string;
  hasPdf: boolean;
};
