"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  Minus,
  Plus,
  X,
} from "lucide-react";
import { Document, Page, pdfjs } from "react-pdf";

import { withDeployedBase } from "@/lib/deployBasePath";
import { pdfViewSource } from "@/lib/pdfViewSource";

import styles from "./pdf-document-viewer.module.css";

pdfjs.GlobalWorkerOptions.workerSrc = withDeployedBase("/pdf.worker.min.mjs");

type Props = {
  url: string;
  downloadUrl?: string;
  title: string;
  onClose?: () => void;
};

export function PdfDocumentViewer({ url, downloadUrl, title, onClose }: Props) {
  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1);
  const [loadError, setLoadError] = useState(false);

  const fileSource = useMemo(() => pdfViewSource(url), [url]);
  const fileDownloadUrl = downloadUrl ?? url;

  useEffect(() => {
    setPageNumber(1);
    setNumPages(0);
    setLoadError(false);
  }, [url]);

  const canPrev = pageNumber > 1;
  const canNext = numPages > 0 && pageNumber < numPages;

  const goPrev = useCallback(() => {
    setPageNumber((current) => Math.max(1, current - 1));
  }, []);

  const goNext = useCallback(() => {
    setPageNumber((current) => (numPages ? Math.min(numPages, current + 1) : current));
  }, [numPages]);

  const zoomOut = useCallback(() => {
    setScale((current) => Math.max(0.6, Number((current - 0.15).toFixed(2))));
  }, []);

  const zoomIn = useCallback(() => {
    setScale((current) => Math.min(2.2, Number((current + 0.15).toFixed(2))));
  }, []);

  const pageLabel = useMemo(() => {
    if (!numPages) return "—";
    return `${pageNumber} / ${numPages}`;
  }, [numPages, pageNumber]);

  return (
    <div className={styles.shell}>
      <div className={styles.toolbar}>
        <div className={styles.toolbarTitle} title={title}>
          {title}
        </div>
        <div className={styles.toolbarActions}>
          <button type="button" onClick={goPrev} disabled={!canPrev} aria-label="Page précédente">
            <ChevronLeft size={18} />
          </button>
          <span className={styles.pageIndicator}>{pageLabel}</span>
          <button type="button" onClick={goNext} disabled={!canNext} aria-label="Page suivante">
            <ChevronRight size={18} />
          </button>
          <span className={styles.divider} aria-hidden />
          <button type="button" onClick={zoomOut} aria-label="Zoom arrière">
            <Minus size={18} />
          </button>
          <span className={styles.zoomLabel}>{Math.round(scale * 100)}%</span>
          <button type="button" onClick={zoomIn} aria-label="Zoom avant">
            <Plus size={18} />
          </button>
          <span className={styles.divider} aria-hidden />
          <a href={fileDownloadUrl} download target="_blank" rel="noopener noreferrer" aria-label="Télécharger">
            <Download size={18} />
          </a>
          <a href={fileDownloadUrl} target="_blank" rel="noopener noreferrer" aria-label="Ouvrir dans un nouvel onglet">
            <ExternalLink size={18} />
          </a>
          {onClose ? (
            <button type="button" onClick={onClose} aria-label="Fermer le lecteur">
              <X size={18} />
            </button>
          ) : null}
        </div>
      </div>

      <div className={styles.viewport}>
        {loadError ? (
          <iframe title={title} src={fileDownloadUrl} className={styles.fallbackFrame} />
        ) : (
          <Document
            file={fileSource}
            loading={<p className={styles.loading}>Chargement du document…</p>}
            error={
              <div className={styles.error}>
                <p>Impossible d’afficher l’aperçu intégré.</p>
                <a href={fileDownloadUrl} target="_blank" rel="noopener noreferrer">
                  Ouvrir le PDF
                </a>
              </div>
            }
            onLoadSuccess={({ numPages: total }) => {
              setNumPages(total);
              setPageNumber(1);
              setLoadError(false);
            }}
            onLoadError={() => setLoadError(true)}
          >
            <Page
              pageNumber={pageNumber}
              scale={scale}
              renderAnnotationLayer
              renderTextLayer
              className={styles.page}
            />
          </Document>
        )}
      </div>
    </div>
  );
}
