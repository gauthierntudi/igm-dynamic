import {
  buildMailContactHtml,
  buildMailContactTextFooter,
  renderMailContactMessageBlock,
  renderMailContactMetaTable,
  renderMailContactReferenceBadge,
} from "@/lib/email/mailContactTemplate";
import {
  getSignalementAcknowledgementCopy,
  resolveSignalementLocale,
} from "@/lib/email/signalementEmailCopy";
import {
  resolveNotifyEmail,
  sendSmtpMail,
  smtpConfigured,
} from "@/lib/email/smtp";
import type { SupportedLocale } from "@/i18n/locales";
import { getSiteOrigin } from "@/lib/seo/siteOrigin";

export type SignalementEmailPayload = {
  id: number;
  reference: string;
  description: string;
  estAnonyme: boolean;
  alerteurNom?: string;
  alerteurEmail?: string;
  alerteurTel?: string;
  province?: string;
  villeSite?: string;
  coords?: string;
  typeInfraction?: string;
  pieceCount: number;
  locale?: SupportedLocale;
};

function excerpt(text: string, max = 500): string {
  const trimmed = text.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 1)}…`;
}

export function buildSignalementAcknowledgementEmail(payload: SignalementEmailPayload): {
  subject: string;
  text: string;
  html: string;
} {
  const locale = resolveSignalementLocale(payload.locale);
  const copy = getSignalementAcknowledgementCopy(locale);
  const subject = copy.subject(payload.reference);
  const greeting = payload.alerteurNom?.trim()
    ? copy.greetingNamed(payload.alerteurNom.trim())
    : copy.greetingDefault;

  const text = [
    greeting,
    "",
    copy.textRegistered,
    "",
    `${locale === "en" ? "Reference" : "Référence"} : ${payload.reference}`,
    "",
    copy.textConfidential,
    "",
    copy.textKeepReference,
    buildMailContactTextFooter(locale),
  ].join("\n");

  const html = buildMailContactHtml({
    locale,
    headline: copy.headline,
    greeting,
    paragraphs: [copy.bodyIntro, copy.bodyLegal],
    contentHtml: renderMailContactReferenceBadge(payload.reference, locale),
  });

  return { subject, text, html };
}

export function buildSignalementAdminNotificationEmail(
  payload: SignalementEmailPayload,
  adminUrl: string,
): { subject: string; text: string; html: string } {
  const subject = `[IGM Signalement] Nouveau signalement ${payload.reference}`;
  const lines = [
    "Un nouveau signalement a été transmis via le formulaire public.",
    "",
    `Référence : ${payload.reference}`,
    `Anonyme : ${payload.estAnonyme ? "Oui" : "Non"}`,
    payload.alerteurNom ? `Nom : ${payload.alerteurNom}` : null,
    payload.alerteurEmail ? `E-mail : ${payload.alerteurEmail}` : null,
    payload.alerteurTel ? `Téléphone : ${payload.alerteurTel}` : null,
    payload.province ? `Province : ${payload.province}` : null,
    payload.villeSite ? `Ville / site : ${payload.villeSite}` : null,
    payload.coords ? `Coordonnées GPS : ${payload.coords}` : null,
    payload.typeInfraction ? `Type d'infraction : ${payload.typeInfraction}` : null,
    `Pièces jointes : ${payload.pieceCount}`,
    "",
    "Description des faits :",
    excerpt(payload.description),
    "",
    `Voir dans l'admin : ${adminUrl}`,
    buildMailContactTextFooter("fr"),
  ].filter(Boolean);

  const text = lines.join("\n");
  const html = buildMailContactHtml({
    locale: "fr",
    headline: `Nouveau signalement ${payload.reference}`,
    greeting: "Bonjour,",
    paragraphs: [
      "Un signalement vient d'être transmis via le formulaire public du site IGM. Merci de l'examiner dans le back-office.",
    ],
    contentHtml: `
      ${renderMailContactMetaTable([
        { label: "Référence", value: payload.reference },
        { label: "Anonyme", value: payload.estAnonyme ? "Oui" : "Non" },
        ...(payload.alerteurNom ? [{ label: "Nom", value: payload.alerteurNom }] : []),
        ...(payload.alerteurEmail ? [{ label: "E-mail", value: payload.alerteurEmail }] : []),
        ...(payload.alerteurTel ? [{ label: "Téléphone", value: payload.alerteurTel }] : []),
        ...(payload.province ? [{ label: "Province", value: payload.province }] : []),
        ...(payload.villeSite ? [{ label: "Ville / site", value: payload.villeSite }] : []),
        ...(payload.coords ? [{ label: "Coordonnées GPS", value: payload.coords }] : []),
        ...(payload.typeInfraction ? [{ label: "Type d'infraction", value: payload.typeInfraction }] : []),
        { label: "Pièces jointes", value: String(payload.pieceCount) },
      ])}
      ${renderMailContactMessageBlock("Description des faits", excerpt(payload.description))}
    `,
    button: { href: adminUrl, label: "Ouvrir le dossier dans l'admin" },
    closingHtml: `<p style="margin:0;font-family:Arial,sans-serif;font-size:14px;line-height:1.5;color:#777;">
      Notification automatique — Inspection Générale des Mines
    </p>`,
  });

  return { subject, text, html };
}

export async function sendSignalementSubmissionEmails(
  payload: SignalementEmailPayload,
  siteEmail?: string | null,
): Promise<{ acknowledgementSent: boolean; adminNotified: boolean }> {
  if (!smtpConfigured()) {
    console.warn("[signalement] SMTP non configuré — e-mails non envoyés.");
    return { acknowledgementSent: false, adminNotified: false };
  }

  const adminUrl = `${getSiteOrigin()}/admin/collections/signalements/${payload.id}`;
  const alerteurEmail = payload.alerteurEmail?.trim().toLowerCase();
  const notifyTo = resolveNotifyEmail(siteEmail)?.trim().toLowerCase() ?? null;

  if (!notifyTo) {
    console.warn(
      "[signalement] CONTACT_NOTIFY_EMAIL absent — notification admin ignorée.",
    );
  }

  let adminNotified = false;
  let acknowledgementSent = false;

  if (notifyTo) {
    console.info(`[signalement] envoi notification admin → ${notifyTo}`);
    const adminMail = buildSignalementAdminNotificationEmail(payload, adminUrl);
    const replyTo =
      alerteurEmail && alerteurEmail !== notifyTo ? alerteurEmail : undefined;
    const result = await sendSmtpMail({
      to: notifyTo,
      subject: adminMail.subject,
      text: adminMail.text,
      html: adminMail.html,
      replyTo,
    });
    adminNotified = result.sent;
    if (!result.sent) {
      console.error("[signalement] notification admin échouée:", result.reason);
    }
  }

  if (alerteurEmail) {
    console.info(`[signalement] envoi accusé → ${alerteurEmail}`);
    const acknowledgement = buildSignalementAcknowledgementEmail(payload);
    const result = await sendSmtpMail({
      to: alerteurEmail,
      subject: acknowledgement.subject,
      text: acknowledgement.text,
      html: acknowledgement.html,
    });
    acknowledgementSent = result.sent;
    if (!result.sent) {
      console.error("[signalement] accusé échoué:", result.reason);
    }
  }

  console.info(
    `[signalement] e-mails terminés — admin=${adminNotified} accusé=${acknowledgementSent} notifyTo=${notifyTo ?? "—"}`,
  );

  return { acknowledgementSent, adminNotified };
}
