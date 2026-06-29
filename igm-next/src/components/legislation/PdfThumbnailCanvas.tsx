"use client";

import { useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";

import { withDeployedBase } from "@/lib/deployBasePath";
import { pdfViewSource } from "@/lib/pdfViewSource";

import styles from "./pdf-thumbnail.module.css";

pdfjs.GlobalWorkerOptions.workerSrc = withDeployedBase("/pdf.worker.min.mjs");

type Props = {
  url: string;
};

export function PdfThumbnailCanvas({ url }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pageWidth, setPageWidth] = useState<number | null>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const updateWidth = () => {
      const next = Math.floor(element.clientWidth);
      if (next > 0) setPageWidth(next);
    };

    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  if (failed) {
    return <div className={styles.fallback} />;
  }

  return (
    <div
      ref={containerRef}
      className={`${styles.canvas} ${ready ? styles.canvasReady : ""}`}
    >
      {pageWidth ? (
        <Document
          file={pdfViewSource(url)}
          loading={null}
          onLoadSuccess={() => setReady(true)}
          onLoadError={() => setFailed(true)}
        >
          <Page
            pageNumber={1}
            width={pageWidth}
            renderTextLayer={false}
            renderAnnotationLayer={false}
            className={styles.page}
          />
        </Document>
      ) : null}
    </div>
  );
}
