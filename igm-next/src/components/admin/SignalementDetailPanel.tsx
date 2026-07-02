"use client";

import { useConfig, useDocumentInfo } from "@payloadcms/ui";
import React, { useCallback, useEffect, useMemo, useState } from "react";

import type { Signalement, SignalementFile } from "@/payload-types";
import { withDeployedBase } from "@/lib/deployBasePath";

import "./signalement-detail-panel.css";

const STATUS_LABELS: Record<NonNullable<Signalement["status"]>, string> = {
  recu: "Reçu",
  en_cours: "En cours",
  traite: "Traité",
  cloture: "Clôturé",
};

function formatDate(value?: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(date);
}

function formatBytes(value?: number | null): string {
  if (typeof value !== "number" || value <= 0) return "—";
  if (value < 1024) return `${value} o`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} Ko`;
  return `${(value / (1024 * 1024)).toFixed(1)} Mo`;
}

function isPopulatedFile(value: unknown): value is SignalementFile {
  return Boolean(value && typeof value === "object" && "id" in value);
}

function fileStreamUrl(file: SignalementFile, apiRoute: string): string | null {
  if (file.url) return file.url;
  if (!file.filename) return null;
  const prefix =
    typeof file.prefix === "string" && file.prefix
      ? `?prefix=${encodeURIComponent(file.prefix)}`
      : "";
  return `${apiRoute}/signalement-files/file/${encodeURIComponent(file.filename)}${prefix}`;
}

function attachmentKindLabel(mime: string): string {
  if (mime.startsWith("image/")) return "Image";
  if (mime.startsWith("audio/")) return "Audio";
  if (mime.startsWith("video/")) return "Vidéo";
  if (mime === "application/pdf") return "PDF";
  return "Fichier";
}

type AttachmentPreviewState = {
  src: string;
  name: string;
  mime: string;
};

function AttachmentModal({
  preview,
  onClose,
}: {
  preview: AttachmentPreviewState;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  const kind = attachmentKindLabel(preview.mime);

  let content: React.ReactNode;
  if (preview.mime.startsWith("image/")) {
    content = <img className="igm-dossier-modal__image" src={preview.src} alt={preview.name} />;
  } else if (preview.mime.startsWith("video/")) {
    content = (
      <video className="igm-dossier-modal__video" controls autoPlay src={preview.src} />
    );
  } else if (preview.mime.startsWith("audio/")) {
    content = (
      <audio className="igm-dossier-modal__audio" controls autoPlay src={preview.src} />
    );
  } else if (preview.mime === "application/pdf") {
    content = (
      <iframe
        className="igm-dossier-modal__pdf"
        src={preview.src}
        title={preview.name}
      />
    );
  } else {
    content = (
      <p className="igm-dossier-modal__fallback">
        Aperçu indisponible pour ce type de fichier ({kind}). Utilisez le téléchargement ci-dessous.
      </p>
    );
  }

  return (
    <div className="igm-dossier-modal" role="dialog" aria-modal="true" aria-labelledby="igm-dossier-modal-title">
      <button
        type="button"
        className="igm-dossier-modal__backdrop"
        onClick={onClose}
        aria-label="Fermer la fenêtre"
      />
      <div className="igm-dossier-modal__panel">
        <header className="igm-dossier-modal__header">
          <div>
            <p className="igm-dossier-modal__kind">{kind}</p>
            <h2 className="igm-dossier-modal__title" id="igm-dossier-modal-title">
              {preview.name}
            </h2>
          </div>
          <button type="button" className="igm-dossier-modal__close" onClick={onClose}>
            Fermer
          </button>
        </header>
        <div className="igm-dossier-modal__body">{content}</div>
        <footer className="igm-dossier-modal__footer">
          <a href={preview.src} download={preview.name}>
            Télécharger
          </a>
        </footer>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="igm-dossier__field">
      <dt className="igm-dossier__field-label">{label}</dt>
      <dd className="igm-dossier__field-value">{value}</dd>
    </div>
  );
}

function AttachmentPreview({
  file,
  apiRoute,
  onOpen,
}: {
  file: SignalementFile;
  apiRoute: string;
  onOpen: (preview: AttachmentPreviewState) => void;
}) {
  const src = fileStreamUrl(file, apiRoute);
  const mime = file.mimeType ?? "";
  const name = file.filename ?? `Fichier ${file.id}`;
  const kind = attachmentKindLabel(mime);

  const openPreview = useCallback(() => {
    if (!src) return;
    onOpen({ src, name, mime });
  }, [mime, name, onOpen, src]);

  if (!src) {
    return (
      <article className="igm-dossier__file igm-dossier__file--unavailable">
        <div className="igm-dossier__file-head">
          <span className="igm-dossier__file-type">{kind}</span>
          <span className="igm-dossier__file-name">{name}</span>
        </div>
        <p className="igm-dossier__file-meta">Fichier indisponible</p>
      </article>
    );
  }

  return (
    <article className="igm-dossier__file">
      <div className="igm-dossier__file-preview">
        {mime.startsWith("image/") ? (
          <button type="button" className="igm-dossier__file-open" onClick={openPreview}>
            <img src={src} alt={name} loading="lazy" />
          </button>
        ) : mime.startsWith("audio/") ? (
          <audio controls preload="metadata" src={src} />
        ) : mime.startsWith("video/") ? (
          <video controls preload="metadata" src={src} />
        ) : (
          <div className="igm-dossier__file-placeholder">
            <span>{kind}</span>
          </div>
        )}
      </div>
      <div className="igm-dossier__file-foot">
        <div className="igm-dossier__file-head">
          <span className="igm-dossier__file-type">{kind}</span>
          <span className="igm-dossier__file-name" title={name}>
            {name}
          </span>
        </div>
        <div className="igm-dossier__file-actions">
          <span className="igm-dossier__file-meta">{formatBytes(file.filesize)}</span>
          <button type="button" className="igm-dossier__file-link" onClick={openPreview}>
            Ouvrir
          </button>
        </div>
      </div>
    </article>
  );
}

export function SignalementDetailPanel() {
  const { config } = useConfig();
  const { data, initialData, id, isInitializing, lastUpdateTime } = useDocumentInfo();
  const [attachments, setAttachments] = useState<SignalementFile[]>([]);
  const [loadingAttachments, setLoadingAttachments] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [attachmentPreview, setAttachmentPreview] = useState<AttachmentPreviewState | null>(null);

  const doc = (data ?? initialData) as Signalement | undefined;
  const apiRoute = config.routes.api;

  useEffect(() => {
    if (!id) {
      setAttachments([]);
      return;
    }

    let cancelled = false;
    setLoadingAttachments(true);

    void fetch(`${apiRoute}/signalements/${id}?depth=2`, { credentials: "include" })
      .then(async (response) => {
        if (!response.ok) throw new Error("fetch failed");
        return response.json() as Promise<Signalement>;
      })
      .then((payload) => {
        if (cancelled) return;
        const pieces = Array.isArray(payload.pieces) ? payload.pieces : [];
        setAttachments(pieces.filter(isPopulatedFile));
      })
      .catch(() => {
        if (!cancelled) setAttachments([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingAttachments(false);
      });

    return () => {
      cancelled = true;
    };
  }, [apiRoute, id, lastUpdateTime]);

  const hasAlerteur = useMemo(() => {
    if (doc?.estAnonyme) return false;
    return Boolean(
      doc?.alerteur?.nom?.trim() ||
        doc?.alerteur?.email?.trim() ||
        doc?.alerteur?.tel?.trim(),
    );
  }, [doc]);

  const pdfDownloadUrl = id ? withDeployedBase(`/api/admin/signalements/${id}/pdf`) : null;

  const handleDownloadPdf = useCallback(async () => {
    if (!pdfDownloadUrl) return;

    setPdfError(null);
    setDownloadingPdf(true);

    try {
      const response = await fetch(pdfDownloadUrl, { credentials: "include" });
      if (!response.ok) throw new Error("Impossible de générer le PDF.");

      const blob = await response.blob();
      const reference = doc?.reference?.trim() || `signalement-${id}`;
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = `${reference.replace(/[^\w.-]+/g, "_")}.pdf`;
      link.click();
      URL.revokeObjectURL(objectUrl);
    } catch {
      setPdfError("Échec du téléchargement PDF. Réessayez.");
    } finally {
      setDownloadingPdf(false);
    }
  }, [doc?.reference, id, pdfDownloadUrl]);

  if (!id) {
    return (
      <div className="igm-dossier igm-dossier--placeholder">
        Enregistrez le signalement pour afficher le dossier complet.
      </div>
    );
  }

  if (isInitializing && !doc) {
    return (
      <div className="igm-dossier igm-dossier--placeholder" aria-busy="true">
        Chargement du dossier…
      </div>
    );
  }

  const status = doc?.status ?? "recu";

  return (
    <div className="igm-dossier">
      {attachmentPreview ? (
        <AttachmentModal preview={attachmentPreview} onClose={() => setAttachmentPreview(null)} />
      ) : null}

      <header className="igm-dossier__header">
        <div className="igm-dossier__header-text">
          <p className="igm-dossier__label">Dossier signalement</p>
          <h2 className="igm-dossier__title">{doc?.reference ?? `#${id}`}</h2>
          <p className="igm-dossier__subtitle">
            Reçu le {formatDate(doc?.createdAt)}
            <span className="igm-dossier__sep">·</span>
            <span className={`igm-dossier__status igm-dossier__status--${status}`}>
              {STATUS_LABELS[status]}
            </span>
            <span className="igm-dossier__sep">·</span>
            <span className="igm-dossier__readonly">Lecture seule</span>
          </p>
        </div>
        <button
          type="button"
          className="igm-dossier__btn"
          onClick={() => void handleDownloadPdf()}
          disabled={downloadingPdf}
        >
          {downloadingPdf ? "Génération…" : "Télécharger PDF"}
        </button>
      </header>

      {pdfError ? <p className="igm-dossier__error">{pdfError}</p> : null}

      <div className="igm-dossier__cards">
        <section className="igm-dossier__card">
          <h3 className="igm-dossier__card-title">Lanceur d&apos;alerte</h3>
          <dl className="igm-dossier__fields">
            <Field label="Anonyme" value={doc?.estAnonyme ? "Oui" : "Non"} />
            {doc?.estAnonyme ? (
              <Field label="Identité" value="Anonyme" />
            ) : hasAlerteur ? (
              <>
                {doc?.alerteur?.nom?.trim() ? (
                  <Field label="Nom" value={doc.alerteur.nom.trim()} />
                ) : null}
                {doc?.alerteur?.email?.trim() ? (
                  <Field
                    label="E-mail"
                    value={
                      <a href={`mailto:${doc.alerteur.email.trim()}`}>
                        {doc.alerteur.email.trim()}
                      </a>
                    }
                  />
                ) : null}
                {doc?.alerteur?.tel?.trim() ? (
                  <Field
                    label="Téléphone"
                    value={
                      <a href={`tel:${doc.alerteur.tel.trim()}`}>{doc.alerteur.tel.trim()}</a>
                    }
                  />
                ) : null}
              </>
            ) : (
              <Field label="Identité" value="Non renseigné" />
            )}
          </dl>
        </section>

        <section className="igm-dossier__card">
          <h3 className="igm-dossier__card-title">Localisation</h3>
          <dl className="igm-dossier__fields">
            <Field label="Province" value={doc?.province ?? "—"} />
            <Field label="Ville / site" value={doc?.villeSite?.trim() || "—"} />
            <Field label="Coordonnées GPS" value={doc?.coords?.trim() || "—"} />
          </dl>
        </section>

        <section className="igm-dossier__card">
          <h3 className="igm-dossier__card-title">Classification</h3>
          <dl className="igm-dossier__fields">
            <Field label="Type d'infraction" value={doc?.typeInfraction ?? "—"} />
            <Field
              label="Pièces jointes"
              value={loadingAttachments ? "…" : attachments.length}
            />
          </dl>
        </section>

        <section className="igm-dossier__card igm-dossier__card--full">
          <h3 className="igm-dossier__card-title">Description des faits</h3>
          <div className="igm-dossier__prose">{doc?.description?.trim() || "—"}</div>
        </section>

        <section className="igm-dossier__card igm-dossier__card--full">
          <h3 className="igm-dossier__card-title">Pièces jointes</h3>
          {loadingAttachments ? (
            <p className="igm-dossier__muted">Chargement des pièces jointes…</p>
          ) : attachments.length === 0 ? (
            <p className="igm-dossier__muted">Aucune pièce jointe transmise.</p>
          ) : (
            <div className="igm-dossier__files">
              {attachments.map((file) => (
                <AttachmentPreview
                  key={file.id}
                  file={file}
                  apiRoute={apiRoute}
                  onOpen={setAttachmentPreview}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
