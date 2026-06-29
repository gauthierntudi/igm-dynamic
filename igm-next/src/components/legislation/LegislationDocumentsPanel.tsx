"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Eye } from "lucide-react";

import { PdfFileTypeIcon } from "@/components/legislation/PdfFileTypeIcon";

import type { SupportedLocale } from "@/i18n/locales";
import { getMessages } from "@/i18n/messages";
import type { CmsLegislationDocument } from "@/lib/cms/legislation/types";
import { mediaPdfViewUrl, mediaUrl } from "@/lib/cdnUrl";

import styles from "./legislation-documents-panel.module.css";

const PAGE_SIZE = 12;

const PdfDocumentViewer = dynamic(
  () => import("./PdfDocumentViewer").then((mod) => mod.PdfDocumentViewer),
  {
    ssr: false,
    loading: () => <div className={styles.viewerLoading}>Chargement du lecteur PDF…</div>,
  },
);

const PdfThumbnail = dynamic(
  () => import("./PdfThumbnail").then((mod) => mod.PdfThumbnail),
  { ssr: false },
);

type Props = {
  locale: SupportedLocale;
  documents: CmsLegislationDocument[];
  query: string;
};

type OpenDocument = {
  id: number;
  title: string;
  viewUrl: string;
  downloadUrl: string;
};

function formatDate(value: string | null | undefined, locale: SupportedLocale): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function resolvePdfUrls(doc: CmsLegislationDocument): { viewUrl: string; downloadUrl: string } {
  if (!doc.file || typeof doc.file !== "object") {
    return { viewUrl: "", downloadUrl: "" };
  }

  return {
    viewUrl: mediaPdfViewUrl(doc.file),
    downloadUrl: mediaUrl(doc.file),
  };
}

function pageItems(current: number, total: number): (number | "ellipsis")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const items: (number | "ellipsis")[] = [1];
  if (current > 3) items.push("ellipsis");

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let p = start; p <= end; p += 1) {
    if (!items.includes(p)) items.push(p);
  }

  if (current < total - 2) items.push("ellipsis");
  if (!items.includes(total)) items.push(total);

  return items;
}

export function LegislationDocumentsPanel({ locale, documents, query }: Props) {
  const t = getMessages(locale).legislationPage;
  const [page, setPage] = useState(1);
  const [openDocument, setOpenDocument] = useState<OpenDocument | null>(null);
  const gridRef = useRef<HTMLUListElement>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return documents;
    return documents.filter((doc) => {
      const haystack = [doc.title, doc.reference, doc.summary]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [documents, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [currentPage, filtered]);

  useEffect(() => {
    setPage(1);
  }, [query, documents]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const goToPage = useCallback((nextPage: number) => {
    setPage(nextPage);
    gridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const closeModal = useCallback(() => setOpenDocument(null), []);

  const openModal = useCallback((doc: CmsLegislationDocument) => {
    const { viewUrl, downloadUrl } = resolvePdfUrls(doc);
    if (!viewUrl) return;
    setOpenDocument({ id: doc.id, title: doc.title, viewUrl, downloadUrl });
  }, []);

  useEffect(() => {
    if (!openDocument) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeModal();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [closeModal, openDocument]);

  return (
    <>
      <div className={styles.layout}>
        {filtered.length > 0 ? (
          <p className={styles.resultsCount}>
            {t.resultsCount.replace("{count}", String(filtered.length))}
          </p>
        ) : null}

        {filtered.length === 0 ? (
          <p className={styles.empty}>{t.emptyDocuments}</p>
        ) : (
          <>
            <ul ref={gridRef} className={styles.grid}>
              {paginated.map((doc) => {
              const dateLabel = formatDate(doc.publishedAt, locale);
              const { viewUrl } = resolvePdfUrls(doc);
              const disabled = !viewUrl;

              return (
                <li key={doc.id}>
                  <button
                    type="button"
                    className={styles.card}
                    disabled={disabled}
                    onClick={() => openModal(doc)}
                  >
                    <div className={styles.thumbWrap}>
                      {viewUrl ? (
                        <PdfThumbnail url={viewUrl} title={doc.title} />
                      ) : (
                        <div className={styles.thumbFallback} aria-hidden />
                      )}
                      <span className={styles.pdfBadge} aria-label="PDF">
                        <PdfFileTypeIcon size={14} />
                      </span>
                      {!disabled ? (
                        <span className={styles.cardOverlay}>
                          <Eye size={18} aria-hidden />
                          {t.viewDocument}
                        </span>
                      ) : null}
                    </div>

                    <div className={styles.cardBody}>
                      <h3 className={styles.cardTitle}>{doc.title}</h3>
                      {(doc.reference || dateLabel) ? (
                        <div className={styles.cardMeta}>
                          {doc.reference ? (
                            <span className={styles.cardRef}>{doc.reference}</span>
                          ) : (
                            <span />
                          )}
                          {dateLabel ? (
                            <time className={styles.cardDate} dateTime={doc.publishedAt ?? undefined}>
                              {dateLabel}
                            </time>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                  </button>
                </li>
              );
            })}
            </ul>

            {totalPages > 1 ? (
              <nav className={styles.pagination} aria-label={t.paginationLabel}>
                <button
                  type="button"
                  className={styles.pageBtn}
                  disabled={currentPage <= 1}
                  onClick={() => goToPage(currentPage - 1)}
                  aria-label={t.paginationPrevious}
                >
                  <ChevronLeft size={18} aria-hidden />
                </button>
                <ul className={styles.pageList}>
                  {pageItems(currentPage, totalPages).map((item, index) =>
                    item === "ellipsis" ? (
                      <li key={`ellipsis-${index}`} className={styles.pageEllipsis}>
                        …
                      </li>
                    ) : (
                      <li key={item}>
                        <button
                          type="button"
                          className={
                            item === currentPage
                              ? `${styles.pageNumber} ${styles.pageNumberActive}`
                              : styles.pageNumber
                          }
                          onClick={() => goToPage(item)}
                          aria-current={item === currentPage ? "page" : undefined}
                        >
                          {item}
                        </button>
                      </li>
                    ),
                  )}
                </ul>
                <button
                  type="button"
                  className={styles.pageBtn}
                  disabled={currentPage >= totalPages}
                  onClick={() => goToPage(currentPage + 1)}
                  aria-label={t.paginationNext}
                >
                  <ChevronRight size={18} aria-hidden />
                </button>
              </nav>
            ) : null}
          </>
        )}
      </div>

      {openDocument ? (
        <div
          className={styles.modalBackdrop}
          role="dialog"
          aria-modal="true"
          aria-labelledby="igm-legislation-pdf-title"
        >
          <button
            type="button"
            className={styles.modalBackdropBtn}
            onClick={closeModal}
            aria-label={t.closeModal}
          />
          <div className={styles.modalPanel}>
            <h2 id="igm-legislation-pdf-title" className={styles.modalSrTitle}>
              {openDocument.title}
            </h2>
            <PdfDocumentViewer
              url={openDocument.viewUrl}
              downloadUrl={openDocument.downloadUrl}
              title={openDocument.title}
              onClose={closeModal}
            />
          </div>
        </div>
      ) : null}
    </>
  );
}
