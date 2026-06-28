import { createRequire } from "node:module";

import type { Signalement, SignalementFile } from "@/payload-types";

const require = createRequire(import.meta.url);
const PDFDocument = require("pdfkit") as typeof import("pdfkit").default;

type PdfDoc = InstanceType<typeof PDFDocument>;

const STATUS_LABELS: Record<NonNullable<Signalement["status"]>, string> = {
  recu: "Reçu",
  en_cours: "En cours",
  traite: "Traité",
  cloture: "Clôturé",
};

const PAGE_MARGIN = 50;
const CONTENT_WIDTH = 495;

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

function sanitizeFilename(value: string): string {
  return value.replace(/[^\w.-]+/g, "_").replace(/_+/g, "_").slice(0, 80);
}

function alerteurText(doc: Signalement): string {
  if (doc.estAnonyme) return "Signalement anonyme";
  const lines: string[] = [];
  if (doc.alerteur?.nom?.trim()) lines.push(doc.alerteur.nom.trim());
  if (doc.alerteur?.email?.trim()) lines.push(doc.alerteur.email.trim());
  if (doc.alerteur?.tel?.trim()) lines.push(doc.alerteur.tel.trim());
  return lines.length ? lines.join("\n") : "Non renseigné";
}

function drawSectionTitle(pdf: PdfDoc, title: string) {
  pdf.moveDown(0.6);
  pdf
    .font("Helvetica-Bold")
    .fontSize(11)
    .fillColor("#1b4491")
    .text(title.toUpperCase(), PAGE_MARGIN, pdf.y, { width: CONTENT_WIDTH });
  pdf.moveDown(0.25);
  pdf
    .moveTo(PAGE_MARGIN, pdf.y)
    .lineTo(PAGE_MARGIN + CONTENT_WIDTH, pdf.y)
    .strokeColor("#d0d7e2")
    .lineWidth(0.75)
    .stroke();
  pdf.moveDown(0.45);
}

function drawField(pdf: PdfDoc, label: string, value: string) {
  pdf.font("Helvetica-Bold").fontSize(9).fillColor("#5c6b82").text(label, {
    width: CONTENT_WIDTH,
  });
  pdf.moveDown(0.1);
  pdf.font("Helvetica").fontSize(10).fillColor("#111111").text(value || "—", {
    width: CONTENT_WIDTH,
  });
  pdf.moveDown(0.35);
}

function ensureSpace(pdf: PdfDoc, minHeight: number) {
  if (pdf.y + minHeight > pdf.page.height - PAGE_MARGIN) {
    pdf.addPage();
  }
}

export type SignalementPdfAttachment = SignalementFile & {
  buffer?: Buffer | null;
};

export function signalementPdfFilename(doc: Signalement, id: string | number): string {
  const ref = doc.reference?.trim() || `signalement-${id}`;
  return `${sanitizeFilename(ref)}.pdf`;
}

export async function buildSignalementPdfBuffer(
  doc: Signalement,
  attachments: SignalementPdfAttachment[],
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const pdf = new PDFDocument({
      size: "A4",
      margin: PAGE_MARGIN,
      info: {
        Title: `Signalement ${doc.reference ?? ""}`.trim(),
        Author: "IGM — Inspection Générale des Mines",
        Subject: "Dossier signalement",
      },
    });

    const chunks: Buffer[] = [];
    pdf.on("data", (chunk: Buffer) => chunks.push(chunk));
    pdf.on("end", () => resolve(Buffer.concat(chunks)));
    pdf.on("error", reject);

    const status = doc.status ?? "recu";
    const generatedAt = new Intl.DateTimeFormat("fr-FR", {
      dateStyle: "long",
      timeStyle: "short",
    }).format(new Date());

    pdf
      .font("Helvetica-Bold")
      .fontSize(10)
      .fillColor("#1b4491")
      .text("INSPECTION GÉNÉRALE DES MINES", { align: "center" });
    pdf.moveDown(0.15);
    pdf.font("Helvetica").fontSize(9).fillColor("#5c6b82").text("Dossier signalement", {
      align: "center",
    });
    pdf.moveDown(0.8);

    pdf
      .font("Helvetica-Bold")
      .fontSize(18)
      .fillColor("#111111")
      .text(doc.reference ?? "—", { width: CONTENT_WIDTH });
    pdf.moveDown(0.15);
    pdf
      .font("Helvetica")
      .fontSize(10)
      .fillColor("#5c6b82")
      .text(`Statut : ${STATUS_LABELS[status]} · Généré le ${generatedAt}`, {
        width: CONTENT_WIDTH,
      });
    pdf.moveDown(0.6);

    drawSectionTitle(pdf, "Informations générales");
    drawField(pdf, "Reçu le", formatDate(doc.createdAt));
    drawField(pdf, "Anonyme", doc.estAnonyme ? "Oui" : "Non");
    drawField(pdf, "Lanceur d'alerte", alerteurText(doc));
    drawField(pdf, "Province", doc.province ?? "—");
    drawField(pdf, "Ville / site minier", doc.villeSite?.trim() || "—");
    drawField(pdf, "Coordonnées GPS", doc.coords?.trim() || "—");
    drawField(pdf, "Type d'infraction", doc.typeInfraction ?? "—");

    drawSectionTitle(pdf, "Description des faits");
    pdf.font("Helvetica").fontSize(10).fillColor("#111111").text(doc.description?.trim() || "—", {
      width: CONTENT_WIDTH,
      align: "left",
    });

    if (doc.notesInternes?.trim()) {
      drawSectionTitle(pdf, "Notes internes");
      pdf
        .font("Helvetica")
        .fontSize(10)
        .fillColor("#111111")
        .text(doc.notesInternes.trim(), { width: CONTENT_WIDTH });
    }

    drawSectionTitle(pdf, `Pièces jointes (${attachments.length})`);

    if (attachments.length === 0) {
      pdf.font("Helvetica").fontSize(10).fillColor("#5c6b82").text("Aucune pièce jointe transmise.", {
        width: CONTENT_WIDTH,
      });
    } else {
      attachments.forEach((file, index) => {
        const name = file.filename ?? `Fichier ${file.id}`;
        const mime = file.mimeType ?? "Type inconnu";

        ensureSpace(pdf, 80);
        pdf
          .font("Helvetica-Bold")
          .fontSize(10)
          .fillColor("#111111")
          .text(`${index + 1}. ${name}`, { width: CONTENT_WIDTH });
        pdf
          .font("Helvetica")
          .fontSize(9)
          .fillColor("#5c6b82")
          .text(`${mime} · ${formatBytes(file.filesize)}`, { width: CONTENT_WIDTH });
        pdf.moveDown(0.25);

        if (mime.startsWith("image/") && file.buffer && file.buffer.length > 0) {
          ensureSpace(pdf, 220);
          try {
            pdf.image(file.buffer, {
              fit: [CONTENT_WIDTH, 220],
              align: "center",
            });
            pdf.moveDown(0.35);
          } catch {
            pdf
              .font("Helvetica")
              .fontSize(9)
              .fillColor("#5c6b82")
              .text("Aperçu image indisponible dans le PDF.", { width: CONTENT_WIDTH });
            pdf.moveDown(0.35);
          }
        } else if (mime.startsWith("audio/")) {
          pdf
            .font("Helvetica")
            .fontSize(9)
            .fillColor("#5c6b82")
            .text("Fichier audio — consulter la pièce jointe originale dans l'admin.", {
              width: CONTENT_WIDTH,
            });
          pdf.moveDown(0.35);
        } else if (mime.startsWith("video/")) {
          pdf
            .font("Helvetica")
            .fontSize(9)
            .fillColor("#5c6b82")
            .text("Fichier vidéo — consulter la pièce jointe originale dans l'admin.", {
              width: CONTENT_WIDTH,
            });
          pdf.moveDown(0.35);
        } else {
          pdf
            .font("Helvetica")
            .fontSize(9)
            .fillColor("#5c6b82")
            .text("Document joint — consulter le fichier original dans l'admin.", {
              width: CONTENT_WIDTH,
            });
          pdf.moveDown(0.35);
        }
      });
    }

    const pageCount = pdf.bufferedPageRange().count;
    for (let page = 0; page < pageCount; page += 1) {
      pdf.switchToPage(page);
      pdf
        .font("Helvetica")
        .fontSize(8)
        .fillColor("#8a94a6")
        .text(`Page ${page + 1} / ${pageCount}`, PAGE_MARGIN, pdf.page.height - 35, {
          width: CONTENT_WIDTH,
          align: "right",
        });
    }

    pdf.end();
  });
}
