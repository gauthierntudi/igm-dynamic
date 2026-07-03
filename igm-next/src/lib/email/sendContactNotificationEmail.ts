import {
  buildIgmEmailHtml,
  buildIgmEmailTextFooter,
  renderIgmEmailButton,
  renderIgmEmailMessageBlock,
  renderIgmEmailMetaTable,
} from "@/lib/email/igmEmailTemplate";
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
    buildIgmEmailTextFooter(),
  ].filter(Boolean);

  const textBody = lines.join("\n");
  const htmlBody = buildIgmEmailHtml({
    preheader: `Nouveau message de ${payload.name} : ${payload.subject}`,
    eyebrow: "Formulaire contact",
    title: payload.subject,
    introHtml: `<p style="margin:0;font-family:Inter,'Google Sans',system-ui,sans-serif;font-size:14px;line-height:1.6;color:#6b6460;">
      Un nouveau message a été transmis via le formulaire de contact du site IGM.
    </p>`,
    bodyHtml: `
      ${renderIgmEmailMetaTable([
        { label: "Nom", value: payload.name },
        { label: "E-mail", value: payload.email },
        ...(payload.phone ? [{ label: "Téléphone", value: payload.phone }] : []),
        { label: "Objet", value: payload.subject },
        ...(payload.locale ? [{ label: "Langue", value: payload.locale.toUpperCase() }] : []),
      ])}
      ${renderIgmEmailMessageBlock("Message", payload.message)}
      ${payload.adminUrl ? renderIgmEmailButton(payload.adminUrl, "Ouvrir dans l'admin") : ""}
    `,
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
