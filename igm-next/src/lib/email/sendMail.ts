import {
  emailConfigured,
  getEmailTransportMode,
  type SendMailOptions,
  type SendMailResult,
} from "@/lib/email/config";
import { sendResendMail } from "@/lib/email/resend";
import { sendSmtpMail } from "@/lib/email/smtp";

export type { SendMailOptions, SendMailResult } from "@/lib/email/config";
export {
  emailConfigured,
  getEmailTransportMode,
  resolveNotifyEmail,
  resendConfigured,
  smtpConfigured,
} from "@/lib/email/config";

export async function sendMail(options: SendMailOptions): Promise<SendMailResult> {
  const mode = getEmailTransportMode();

  if (!emailConfigured()) {
    return {
      sent: false,
      reason:
        mode === "resend"
          ? "Resend non configuré (RESEND_API_KEY, RESEND_FROM ou SMTP_FROM)."
          : "SMTP non configuré (SMTP_HOST, SMTP_FROM).",
    };
  }

  if (mode === "resend") {
    return sendResendMail(options);
  }

  return sendSmtpMail(options);
}
