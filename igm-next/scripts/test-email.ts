/**
 * Teste l'envoi e-mail (SMTP ou Resend selon SYS_ENVOI).
 *
 * Usage:
 *   npx tsx --env-file=.env.local scripts/test-email.ts
 *   npx tsx --env-file=.env.local scripts/test-email.ts vous@example.com
 */
import {
  emailConfigured,
  getEmailTransportMode,
  resolveEmailFrom,
  resolveNotifyEmail,
  resendConfigured,
  smtpConfigured,
} from "../src/lib/email/config";
import { sendMail } from "../src/lib/email/sendMail";

async function main() {
  const mode = getEmailTransportMode();
  const to = process.argv[2]?.trim() || resolveNotifyEmail() || process.env.SMTP_USER?.trim();

  console.log("── Test envoi e-mail IGM ──");
  console.log(`SYS_ENVOI     : ${mode}`);
  console.log(`SMTP ok       : ${smtpConfigured()}`);
  console.log(`Resend ok     : ${resendConfigured()}`);
  console.log(`Prêt à envoyer: ${emailConfigured()}`);

  const from = resolveEmailFrom();
  if (from) {
    console.log(`Expéditeur    : ${from.name} <${from.address}>`);
  }

  if (!emailConfigured()) {
    console.error("\n✗ Configuration incomplète.");
    if (mode === "resend") {
      console.error("  Vérifiez RESEND_API_KEY et RESEND_FROM (ou SMTP_FROM).");
    } else {
      console.error("  Vérifiez SMTP_HOST, SMTP_FROM, SMTP_USER, SMTP_PASS.");
    }
    process.exit(1);
  }

  if (!to || !to.includes("@")) {
    console.error("\n✗ Destinataire manquant.");
    console.error("  Passez une adresse en argument ou définissez CONTACT_NOTIFY_EMAIL.");
    process.exit(1);
  }

  console.log(`Destinataire  : ${to}\n`);

  const result = await sendMail({
    to,
    subject: `[IGM Test] Envoi ${mode.toUpperCase()} — ${new Date().toISOString()}`,
    text: [
      "Ceci est un e-mail de test IGM.",
      "",
      `Mode : ${mode}`,
      `Date : ${new Date().toLocaleString("fr-FR")}`,
      "",
      "Si vous recevez ce message, l'envoi fonctionne correctement.",
    ].join("\n"),
    html: `<p>Ceci est un <strong>e-mail de test IGM</strong>.</p>
<p>Mode : <code>${mode}</code><br>
Date : ${new Date().toLocaleString("fr-FR")}</p>
<p>Si vous recevez ce message, l'envoi fonctionne correctement.</p>`,
  });

  if (result.sent) {
    console.log(`✓ E-mail envoyé avec succès via ${mode}.`);
    console.log("  Vérifiez la boîte de réception (et les spams).");
    process.exit(0);
  }

  console.error(`✗ Échec : ${result.reason ?? "raison inconnue"}`);
  process.exit(1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
