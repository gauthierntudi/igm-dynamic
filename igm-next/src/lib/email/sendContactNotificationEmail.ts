import nodemailer from "nodemailer";

type ContactEmailPayload = {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  locale?: string;
  adminUrl?: string;
};

function smtpConfigured(): boolean {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_FROM);
}

function resolveNotifyEmail(fallback?: string | null): string | null {
  return (
    process.env.CONTACT_NOTIFY_EMAIL?.trim() ||
    fallback?.trim() ||
    process.env.SMTP_FROM?.trim() ||
    null
  );
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

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

  const port = Number.parseInt(process.env.SMTP_PORT ?? "587", 10);
  const secure = process.env.SMTP_SECURE === "true" || port === 465;

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure,
    auth:
      process.env.SMTP_USER && process.env.SMTP_PASS
        ? {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          }
        : undefined,
  });

  const lines = [
    `Nom : ${payload.name}`,
    `E-mail : ${payload.email}`,
    payload.phone ? `Téléphone : ${payload.phone}` : null,
    `Objet : ${payload.subject}`,
    payload.locale ? `Langue : ${payload.locale.toUpperCase()}` : null,
    "",
    payload.message,
    "",
    payload.adminUrl ? `Voir dans l'admin : ${payload.adminUrl}` : null,
  ].filter(Boolean);

  const textBody = lines.join("\n");
  const htmlBody = `
    <p><strong>Nouveau message via le formulaire de contact</strong></p>
    <ul>
      <li><strong>Nom :</strong> ${escapeHtml(payload.name)}</li>
      <li><strong>E-mail :</strong> ${escapeHtml(payload.email)}</li>
      ${payload.phone ? `<li><strong>Téléphone :</strong> ${escapeHtml(payload.phone)}</li>` : ""}
      <li><strong>Objet :</strong> ${escapeHtml(payload.subject)}</li>
      ${payload.locale ? `<li><strong>Langue :</strong> ${escapeHtml(payload.locale.toUpperCase())}</li>` : ""}
    </ul>
    <p><strong>Message :</strong></p>
    <p style="white-space:pre-wrap">${escapeHtml(payload.message)}</p>
    ${payload.adminUrl ? `<p><a href="${escapeHtml(payload.adminUrl)}">Ouvrir dans l'admin</a></p>` : ""}
  `;

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      replyTo: payload.email,
      subject: `[IGM Contact] ${payload.subject}`,
      text: textBody,
      html: htmlBody,
    });
    return { sent: true };
  } catch (error) {
    console.error("[contact] e-mail notification failed", error);
    return { sent: false, reason: "Échec d'envoi SMTP." };
  }
}
