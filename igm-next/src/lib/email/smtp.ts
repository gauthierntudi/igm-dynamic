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

export function createSmtpTransporter() {
  const port = Number.parseInt(process.env.SMTP_PORT ?? "587", 10);
  const secure = process.env.SMTP_SECURE === "true" || port === 465;

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
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: options.to,
      replyTo: options.replyTo,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });
    return { sent: true };
  } catch (error) {
    console.error("[email] SMTP send failed", error);
    return { sent: false, reason: "Échec d'envoi SMTP." };
  }
}
