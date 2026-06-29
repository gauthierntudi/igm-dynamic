"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  Info,
  Maximize2,
  Minimize2,
  Minus,
  Plus,
  X,
} from "lucide-react";
import { Document, Page, pdfjs } from "react-pdf";

import { withDeployedBase } from "@/lib/deployBasePath";
import { pdfViewSource } from "@/lib/pdfViewSource";

import styles from "./pdf-document-viewer.module.css";

pdfjs.GlobalWorkerOptions.workerSrc = withDeployedBase("/pdf.worker.min.mjs");

export type PdfViewerLabels = {
  previousPage: string;
  nextPage: string;
  zoomOut: string;
  zoomIn: string;
  download: string;
  openNewTab: string;
  close: string;
  fullscreen: string;
  exitFullscreen: string;
  summary: string;
  closeSummary: string;
  noSummary: string;
  loading: string;
  loadError: string;
  openPdf: string;
};

type Props = {
  url: string;
  downloadUrl?: string;
  title: string;
  summary?: string | null;
  reference?: string | null;
  labels: PdfViewerLabels;
  onClose?: () => void;
};

export function PdfDocumentViewer({
  url,
  downloadUrl,
  title,
  summary,
  reference,
  labels,
  onClose,
}: Props) {
  const shellRef = useRef<HTMLDivElement>(null);
  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1);
  const [loadError, setLoadError] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const fileSource = useMemo(() => pdfViewSource(url), [url]);
  const fileDownloadUrl = downloadUrl ?? url;
  const summaryText = summary?.trim() || "";

  useEffect(() => {
    setPageNumber(1);
    setNumPages(0);
    setLoadError(false);
    setShowSummary(false);
  }, [url]);

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === shellRef.current);
    };

    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  const exitFullscreen = useCallback(async () => {
    if (document.fullscreenElement) {
      await document.exitFullscreen().catch(() => undefined);
    }
  }, []);

  const toggleFullscreen = useCallback(async () => {
    const shell = shellRef.current;
    if (!shell) return;

    if (document.fullscreenElement === shell) {
      await exitFullscreen();
      return;
    }

    await shell.requestFullscreen().catch(() => undefined);
  }, [exitFullscreen]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;

      if (showSummary) {
        event.preventDefault();
        event.stopImmediatePropagation();
        setShowSummary(false);
        return;
      }

      if (document.fullscreenElement === shellRef.current) {
        event.preventDefault();
        event.stopImmediatePropagation();
        void exitFullscreen();
      }
    };

    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [exitFullscreen, showSummary]);

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
    <div ref={shellRef} className={`${styles.shell}${isFullscreen ? ` ${styles.shellFullscreen}` : ""}`}>
      <div className={styles.toolbar}>
        <div className={styles.toolbarTitle} title={title}>
          {title}
        </div>
        <div className={styles.toolbarActions}>
          <button type="button" onClick={goPrev} disabled={!canPrev} aria-label={labels.previousPage}>
            <ChevronLeft size={18} />
          </button>
          <span className={styles.pageIndicator}>{pageLabel}</span>
          <button type="button" onClick={goNext} disabled={!canNext} aria-label={labels.nextPage}>
            <ChevronRight size={18} />
          </button>
          <span className={styles.divider} aria-hidden />
          <button type="button" onClick={zoomOut} aria-label={labels.zoomOut}>
            <Minus size={18} />
          </button>
          <span className={styles.zoomLabel}>{Math.round(scale * 100)}%</span>
          <button type="button" onClick={zoomIn} aria-label={labels.zoomIn}>
            <Plus size={18} />
          </button>
          <span className={styles.divider} aria-hidden />
          <button
            type="button"
            onClick={() => setShowSummary(true)}
            aria-label={labels.summary}
            className={showSummary ? styles.toolbarBtnActive : undefined}
          >
            <Info size={18} />
          </button>
          <button
            type="button"
            onClick={() => void toggleFullscreen()}
            aria-label={isFullscreen ? labels.exitFullscreen : labels.fullscreen}
          >
            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
          <span className={styles.divider} aria-hidden />
          <a href={fileDownloadUrl} download target="_blank" rel="noopener noreferrer" aria-label={labels.download}>
            <Download size={18} />
          </a>
          <a href={fileDownloadUrl} target="_blank" rel="noopener noreferrer" aria-label={labels.openNewTab}>
            <ExternalLink size={18} />
          </a>
          {onClose ? (
            <button type="button" onClick={onClose} aria-label={labels.close}>
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
            loading={<p className={styles.loading}>{labels.loading}</p>}
            error={
              <div className={styles.error}>
                <p>{labels.loadError}</p>
                <a href={fileDownloadUrl} target="_blank" rel="noopener noreferrer">
                  {labels.openPdf}
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
              renderTextLayer={false}
              renderAnnotationLayer={false}
              className={styles.page}
            />
          </Document>
        )}
      </div>

      {showSummary ? (
        <div className={styles.summaryLayer} role="presentation">
          <button
            type="button"
            className={styles.summaryBackdrop}
            onClick={() => setShowSummary(false)}
            aria-label={labels.closeSummary}
          />
          <div
            className={styles.summaryPanel}
            role="dialog"
            aria-modal="true"
            aria-labelledby="igm-pdf-summary-title"
          >
            <div className={styles.summaryHeader}>
              <h3 id="igm-pdf-summary-title" className={styles.summaryTitle}>
                {labels.summary}
              </h3>
              <button
                type="button"
                className={styles.summaryClose}
                onClick={() => setShowSummary(false)}
                aria-label={labels.closeSummary}
              >
                <X size={18} />
              </button>
            </div>
            {reference ? <p className={styles.summaryReference}>{reference}</p> : null}
            <div className={styles.summaryBody}>
              {summaryText ? (
                <p className={styles.summaryText}>{summaryText}</p>
              ) : (
                <p className={styles.summaryEmpty}>{labels.noSummary}</p>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
