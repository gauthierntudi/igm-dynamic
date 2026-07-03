import {
  buildIgmEmailHtml,
  buildIgmEmailTextFooter,
  renderIgmEmailButton,
  renderIgmEmailInfoBox,
  renderIgmEmailMessageBlock,
  renderIgmEmailMetaTable,
  renderIgmEmailReferenceBadge,
  renderIgmEmailSuccessBanner,
} from "@/lib/email/igmEmailTemplate";
import {
  createSmtpTransporter,
  escapeHtml,
  resolveNotifyEmail,
  sendSmtpMail,
  smtpConfigured,
} from "@/lib/email/smtp";
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
  const subject = `[IGM] Accusé de réception — ${payload.reference}`;
  const greeting = payload.alerteurNom?.trim()
    ? `Bonjour ${payload.alerteurNom.trim()},`
    : "Bonjour,";

  const text = [
    greeting,
    "",
    "Nous accusons réception de votre signalement transmis à l'Inspection Générale des Mines (IGM).",
    "",
    `Référence : ${payload.reference}`,
    "",
    "Votre déclaration a été enregistrée et sera examinée par nos équipes dans le cadre de nos missions légales.",
    "Les informations transmises sont traitées de manière confidentielle.",
    "",
    "Conservez cette référence pour toute correspondance ultérieure avec l'IGM.",
    buildIgmEmailTextFooter(),
  ].join("\n");

  const html = buildIgmEmailHtml({
    preheader: `Signalement ${payload.reference} enregistré avec succès.`,
    eyebrow: "Accusé de réception",
    title: "Votre signalement a bien été enregistré",
    variant: "success",
    introHtml: `<p style="margin:0 0 14px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.65;color:#1c1412;">${escapeHtml(greeting)}</p>
      <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.65;color:#6b6460;">
        Nous accusons réception de votre signalement transmis à l'Inspection Générale des Mines.
      </p>`,
    bodyHtml: `
      ${renderIgmEmailSuccessBanner("Votre déclaration a été transmise avec succès.")}
      ${renderIgmEmailReferenceBadge(payload.reference)}
      ${renderIgmEmailInfoBox(
        "Prochaines étapes",
        "Votre déclaration sera examinée par nos équipes dans le cadre de nos missions légales. " +
          "Conservez la référence ci-dessus pour toute correspondance ultérieure avec l'IGM.",
      )}
      ${renderIgmEmailInfoBox(
        "Confidentialité",
        "Les informations transmises sont traitées de manière <strong>confidentielle</strong>, " +
          "conformément aux missions de l'IGM en matière de lutte contre la fraude et la contrebande minières.",
      )}
    `,
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
    buildIgmEmailTextFooter(),
  ].filter(Boolean);

  const text = lines.join("\n");
  const html = buildIgmEmailHtml({
    preheader: `Nouveau signalement ${payload.reference} — action requise.`,
    eyebrow: "Notification interne",
    title: `Nouveau signalement ${payload.reference}`,
    variant: "alert",
    introHtml: `<p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.65;color:#6b6460;">
      Un signalement vient d'être transmis via le formulaire public du site IGM. Merci de l'examiner dans le back-office.
    </p>`,
    bodyHtml: `
      ${renderIgmEmailMetaTable([
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
      ${renderIgmEmailMessageBlock("Description des faits", excerpt(payload.description))}
      ${renderIgmEmailButton(adminUrl, "Ouvrir le dossier dans l'admin")}
    `,
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

  const transporter = createSmtpTransporter();
  let adminNotified = false;
  let acknowledgementSent = false;

  try {
    if (notifyTo) {
      console.info(`[signalement] envoi notification admin → ${notifyTo}`);
      const adminMail = buildSignalementAdminNotificationEmail(payload, adminUrl);
      const replyTo =
        alerteurEmail && alerteurEmail !== notifyTo ? alerteurEmail : undefined;
      const result = await sendSmtpMail(
        {
          to: notifyTo,
          subject: adminMail.subject,
          text: adminMail.text,
          html: adminMail.html,
          replyTo,
        },
        transporter,
      );
      adminNotified = result.sent;
      if (!result.sent) {
        console.error("[signalement] notification admin échouée:", result.reason);
      }
    }

    if (alerteurEmail) {
      console.info(`[signalement] envoi accusé → ${alerteurEmail}`);
      const acknowledgement = buildSignalementAcknowledgementEmail(payload);
      const result = await sendSmtpMail(
        {
          to: alerteurEmail,
          subject: acknowledgement.subject,
          text: acknowledgement.text,
          html: acknowledgement.html,
        },
        transporter,
      );
      acknowledgementSent = result.sent;
      if (!result.sent) {
        console.error("[signalement] accusé échoué:", result.reason);
      }
    }
  } finally {
    transporter.close();
  }

  console.info(
    `[signalement] e-mails terminés — admin=${adminNotified} accusé=${acknowledgementSent} notifyTo=${notifyTo ?? "—"}`,
  );

  return { acknowledgementSent, adminNotified };
}
