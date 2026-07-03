import {
  buildMailContactHtml,
  buildMailContactTextFooter,
  renderMailContactMessageBlock,
  renderMailContactMetaTable,
} from "@/lib/email/mailContactTemplate";
import {
  resolveNotifyEmail,
  sendSmtpMail,
  smtpConfigured,
} from "@/lib/email/smtp";

type ContactEmailPayload = {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  locale?: string;
  adminUrl?: string;
};

export async function sendContactNotificationEmail(
  payload: ContactEmailPayload,
  siteEmail?: string | null,
): Promise<{ sent: boolean; reason?: string }> {
  const to = resolveNotifyEmail(siteEmail);
  if (!to) {
    return { sent: false, reason: "Aucune adresse de notification configurée." };
  }

  if (!smtpConfigured()) {
    console.warn("[contact] SMTP non configuré — message enregistré sans e-mail.");
    return { sent: false, reason: "SMTP non configuré." };
  }

  const lines = [
    "Nouveau message via le formulaire de contact.",
    "",
    `Nom : ${payload.name}`,
    `E-mail : ${payload.email}`,
    payload.phone ? `Téléphone : ${payload.phone}` : null,
    `Objet : ${payload.subject}`,
    payload.locale ? `Langue : ${payload.locale.toUpperCase()}` : null,
    "",
    payload.message,
    "",
    payload.adminUrl ? `Voir dans l'admin : ${payload.adminUrl}` : null,
    buildMailContactTextFooter(),
  ].filter(Boolean);

  const textBody = lines.join("\n");
  const htmlBody = buildMailContactHtml({
    headline: payload.subject,
    greeting: "Bonjour,",
    paragraphs: [
      "Un nouveau message a été transmis via le formulaire de contact du site IGM.",
    ],
    contentHtml: `
      ${renderMailContactMetaTable([
        { label: "Nom", value: payload.name },
        { label: "E-mail", value: payload.email },
        ...(payload.phone ? [{ label: "Téléphone", value: payload.phone }] : []),
        { label: "Objet", value: payload.subject },
        ...(payload.locale ? [{ label: "Langue", value: payload.locale.toUpperCase() }] : []),
      ])}
      ${renderMailContactMessageBlock("Message", payload.message)}
    `,
    button: payload.adminUrl
      ? { href: payload.adminUrl, label: "Ouvrir dans l'admin" }
      : undefined,
    closingHtml: `<p style="margin:0;font-family:Arial,sans-serif;font-size:14px;line-height:1.5;color:#777;">
      Notification automatique — Inspection Générale des Mines
    </p>`,
  });

  const result = await sendSmtpMail({
    to,
    subject: `[IGM Contact] ${payload.subject}`,
    text: textBody,
    html: htmlBody,
    replyTo: payload.email,
  });

  if (!result.sent) {
    console.error("[contact] e-mail notification failed", result.reason);
  }

  return result;
}
