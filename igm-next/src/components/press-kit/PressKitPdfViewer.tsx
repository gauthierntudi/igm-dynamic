"use client";

import dynamic from "next/dynamic";

import type { PdfViewerLabels } from "@/components/legislation/PdfDocumentViewer";

import "./press-kit-page.css";

const PdfDocumentViewer = dynamic(
  () => import("@/components/legislation/PdfDocumentViewer").then((mod) => mod.PdfDocumentViewer),
  {
    ssr: false,
    loading: () => <div className="igm-press-kit-viewer-loading">Chargement du lecteur PDF…</div>,
  },
);

type Props = {
  title: string;
  viewUrl: string;
  downloadUrl: string;
  labels: PdfViewerLabels;
};

export function PressKitPdfViewer({ title, viewUrl, downloadUrl, labels }: Props) {
  return (
    <div className="igm-press-kit-viewer">
      <PdfDocumentViewer
        url={viewUrl}
        downloadUrl={downloadUrl}
        title={title}
        labels={labels}
      />
    </div>
  );
}
