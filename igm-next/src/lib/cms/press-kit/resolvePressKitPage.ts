import type { SupportedLocale } from "@/i18n/locales";
import { getMessages } from "@/i18n/messages";
import { mediaPdfViewUrl, mediaUrl } from "@/lib/cdnUrl";

import type { CmsMedia } from "../types";
import type { CmsPressKitPage, ResolvedPressKitPage } from "./types";

function pickText(value: string | null | undefined, fallback: string): string {
  return value?.trim() || fallback;
}

function resolvePdfMedia(
  media: CmsMedia | number | null | undefined,
): { title: string; viewUrl: string; downloadUrl: string } | null {
  if (!media || typeof media !== "object") return null;

  const viewUrl = mediaPdfViewUrl(media);
  const downloadUrl = mediaUrl(media);
  if (!viewUrl && !downloadUrl) return null;

  const title =
    media.alt?.trim() ||
    media.filename?.replace(/\.pdf$/i, "").replace(/[-_]+/g, " ").trim() ||
    "Présentation IGM";

  return {
    title,
    viewUrl: viewUrl || downloadUrl,
    downloadUrl: downloadUrl || viewUrl,
  };
}

export function resolvePressKitPage(
  cms: CmsPressKitPage | null | undefined,
  locale: SupportedLocale,
): ResolvedPressKitPage {
  const t = getMessages(locale).pressKitPage;
  const pdf = resolvePdfMedia(cms?.presentationPdf);

  return {
    seoTitle: pickText(cms?.seoTitle, t.metaTitle),
    seoDescription: pickText(cms?.seoDescription, t.metaDescription),
    heroTitle: pickText(cms?.heroTitle, t.heroTitle),
    heroLead: pickText(cms?.heroLead, t.heroLead),
    intro: pickText(cms?.intro, t.intro),
    downloadLabel: pickText(cms?.downloadLabel, t.downloadLabel),
    pdfTitle: pdf?.title ?? t.pdfTitle,
    pdfViewUrl: pdf?.viewUrl ?? "",
    pdfDownloadUrl: pdf?.downloadUrl ?? "",
    hasPdf: Boolean(pdf?.viewUrl || pdf?.downloadUrl),
  };
}
