import nodemailer from "nodemailer";

export function smtpConfigured(): boolean {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_FROM);
}

export function resolveNotifyEmail(fallback?: string | null): string | null {
  return (
    process.env.CONTACT_NOTIFY_EMAIL?.trim() ||
    fallback?.trim() ||
    process.env.SMTP_FROM?.trim() ||
    null
  );
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function getServerBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000").replace(/\/$/, "");
}

/** Normalise SMTP_FROM (guillemets éventuels dans .env). */
export function parseSmtpFrom(value?: string | null): string {
  const trimmed = value?.trim().replace(/^["']|["']$/g, "") ?? "";
  return trimmed;
}

export function createSmtpTransporter() {
  const port = Number.parseInt(process.env.SMTP_PORT ?? "587", 10);
  // Port 587 = STARTTLS ; 465 = SSL direct.
  const secure = port === 465;

  return nodemailer.createTransport({
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
}

export type SendSmtpMailOptions = {
  to: string;
  subject: string;
  text: string;
  html: string;
  replyTo?: string;
};

export async function sendSmtpMail(
  options: SendSmtpMailOptions,
): Promise<{ sent: boolean; reason?: string }> {
  if (!smtpConfigured()) {
    return { sent: false, reason: "SMTP non configuré." };
  }

  const transporter = createSmtpTransporter();

  try {
    const from = parseSmtpFrom(process.env.SMTP_FROM);
    if (!from) {
      console.error("[email] SMTP_FROM manquant");
      return { sent: false, reason: "SMTP_FROM manquant." };
    }

    await transporter.sendMail({
      from,
      to: options.to,
      replyTo: options.replyTo,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });
    console.info(`[email] envoyé → ${options.to} (${options.subject})`);
    return { sent: true };
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    console.error(`[email] échec envoi → ${options.to} (${options.subject}):`, detail);
    return { sent: false, reason: detail || "Échec d'envoi SMTP." };
  }
}
