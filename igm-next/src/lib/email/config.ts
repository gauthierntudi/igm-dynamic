export type EmailTransportMode = "smtp" | "resend";

export type SendMailOptions = {
  to: string;
  subject: string;
  text: string;
  html: string;
  replyTo?: string;
};

export type SendMailResult = { sent: boolean; reason?: string };

/** Mode d'envoi — `SYS_ENVOI=resend` ou `SYS_ENVOI=smtp` (défaut : smtp). */
export function getEmailTransportMode(): EmailTransportMode {
  const raw = process.env.SYS_ENVOI?.trim().toLowerCase();
  if (raw === "resend") return "resend";
  return "smtp";
}

/** Normalise une adresse expéditeur (guillemets éventuels dans .env). */
export function parseSmtpFrom(value?: string | null): string {
  return value?.trim().replace(/^["']|["']$/g, "") ?? "";
}

export function parseFromParts(rawFrom: string): { name: string; address: string } {
  const match = rawFrom.match(/^(.+?)\s*<([^>]+)>$/);
  if (match) {
    return {
      name: match[1].trim().replace(/^["']|["']$/g, ""),
      address: match[2].trim(),
    };
  }

  return { name: "IGM", address: rawFrom };
}

/** Adresse expéditeur — RESEND_FROM ou SMTP_FROM. */
export function resolveEmailFromRaw(): string {
  return parseSmtpFrom(process.env.RESEND_FROM) || parseSmtpFrom(process.env.SMTP_FROM);
}

export function resolveEmailFrom(): { name: string; address: string } | null {
  const raw = resolveEmailFromRaw();
  if (!raw || !raw.includes("@")) return null;
  return parseFromParts(raw);
}

export function formatEmailFromHeader(from: { name: string; address: string }): string {
  if (from.name && from.name !== from.address) {
    return `${from.name} <${from.address}>`;
  }
  return from.address;
}

export function smtpConfigured(): boolean {
  return Boolean(process.env.SMTP_HOST && parseSmtpFrom(process.env.SMTP_FROM));
}

export function resendConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim() && resolveEmailFrom());
}

export function emailConfigured(): boolean {
  return getEmailTransportMode() === "resend" ? resendConfigured() : smtpConfigured();
}

/** Adresse de notification admin — CONTACT_NOTIFY_EMAIL ou e-mail du site. */
export function resolveNotifyEmail(fallback?: string | null): string | null {
  const notify = process.env.CONTACT_NOTIFY_EMAIL?.trim();
  if (notify) return notify;

  const site = fallback?.trim();
  if (site && site.includes("@")) return site;

  return null;
}
