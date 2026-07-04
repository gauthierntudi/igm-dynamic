import { nodemailerAdapter } from "@payloadcms/email-nodemailer";

import { parseSmtpFrom, smtpConfigured } from "@/lib/email/smtp";

function parseFromParts(rawFrom: string): { name: string; address: string } {
  const match = rawFrom.match(/^(.+?)\s*<([^>]+)>$/);
  if (match) {
    return {
      name: match[1].trim().replace(/^["']|["']$/g, ""),
      address: match[2].trim(),
    };
  }

  return { name: "IGM", address: rawFrom };
}

/** Adaptateur e-mail Payload (reset mot de passe admin, etc.) — réutilise SMTP_* */
export function buildPayloadEmailAdapter() {
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
