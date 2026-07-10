import { Resend } from "resend";

import {
  formatEmailFromHeader,
  resendConfigured,
  resolveEmailFrom,
  type SendMailOptions,
  type SendMailResult,
} from "@/lib/email/config";

export async function sendResendMail(options: SendMailOptions): Promise<SendMailResult> {
  if (!resendConfigured()) {
    return { sent: false, reason: "Resend non configuré (RESEND_API_KEY / expéditeur)." };
  }

  const apiKey = process.env.RESEND_API_KEY!.trim();
  const from = resolveEmailFrom();
  if (!from) {
    return { sent: false, reason: "Adresse expéditeur manquante (RESEND_FROM ou SMTP_FROM)." };
  }

  const resend = new Resend(apiKey);

  try {
    const { data, error } = await resend.emails.send({
      from: formatEmailFromHeader(from),
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
      replyTo: options.replyTo,
    });

    if (error) {
      const detail = error.message || "Échec d'envoi Resend.";
      console.error(`[email:resend] échec → ${options.to} (${options.subject}):`, detail);
      return { sent: false, reason: detail };
    }

    console.info(
      `[email:resend] envoyé → ${options.to} (${options.subject}) id=${data?.id ?? "?"}`,
    );
    return { sent: true };
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    console.error(`[email:resend] échec → ${options.to} (${options.subject}):`, detail);
    return { sent: false, reason: detail || "Échec d'envoi Resend." };
  }
}
