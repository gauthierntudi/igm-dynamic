import { resendAdapter } from "@payloadcms/email-resend";
import { nodemailerAdapter } from "@payloadcms/email-nodemailer";

import {
  getEmailTransportMode,
  parseFromParts,
  resendConfigured,
  resolveEmailFromRaw,
  smtpConfigured,
} from "@/lib/email/config";
import { parseSmtpFrom } from "@/lib/email/smtp";

/** Adaptateur e-mail Payload (reset mot de passe admin, etc.) — suit SYS_ENVOI. */
export function buildPayloadEmailAdapter() {
  const mode = getEmailTransportMode();

  if (mode === "resend") {
    if (!resendConfigured()) {
      return undefined;
    }

    const from = parseFromParts(resolveEmailFromRaw());
    return resendAdapter({
      defaultFromAddress: from.address,
      defaultFromName: from.name,
      apiKey: process.env.RESEND_API_KEY!.trim(),
    });
  }

  if (!smtpConfigured()) {
    return undefined;
  }

  const from = parseSmtpFrom(process.env.SMTP_FROM);
  const { name, address } = parseFromParts(from);
  const port = Number.parseInt(process.env.SMTP_PORT ?? "587", 10);

  return nodemailerAdapter({
    defaultFromAddress: address,
    defaultFromName: name,
    skipVerify: true,
    transportOptions: {
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465,
      auth:
        process.env.SMTP_USER && process.env.SMTP_PASS
          ? {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS,
            }
          : undefined,
    },
  });
}
