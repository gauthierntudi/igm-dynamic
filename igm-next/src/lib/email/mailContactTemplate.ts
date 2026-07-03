import { escapeHtml } from "@/lib/email/smtp";

const IGM_SITE = "https://www.igmrdc.com";
const LOGO_URL = `${IGM_SITE}/assets/img/logo-color.png`;

export type MailContactButton = {
  href: string;
  label: string;
};

export type MailContactTemplateOptions = {
  headline?: string;
  greeting?: string;
  paragraphs?: string[];
  contentHtml?: string;
  closingHtml?: string;
  button?: MailContactButton;
};

export function buildMailContactTextFooter(): string {
  return ["", "—", "Inspection Générale des Mines", "République Démocratique du Congo", IGM_SITE].join(
    "\n",
  );
}

function renderParagraphs(paragraphs: string[]): string {
  return paragraphs
    .filter((p) => p.trim())
    .map(
      (p) =>
        `<p style="margin:0 0 16px;font-family:Arial,sans-serif;font-size:15px;line-height:1.5;color:#333;">${p}</p>`,
    )
    .join("\n");
}

export function renderMailContactMetaTable(
  rows: { label: string; value: string }[],
): string {
  const items = rows
    .filter((row) => row.value.trim())
    .map(
      (row) => `
        <tr>
          <td style="padding:8px 12px 8px 0;font-family:Arial,sans-serif;font-size:13px;font-weight:700;color:#505050;vertical-align:top;width:38%;">
            ${escapeHtml(row.label)}
          </td>
          <td style="padding:8px 0;font-family:Arial,sans-serif;font-size:14px;line-height:1.5;color:#333;vertical-align:top;">
            ${escapeHtml(row.value)}
          </td>
        </tr>
      `,
    )
    .join("");

  if (!items) return "";

  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:18px 0;border-collapse:collapse;">
      ${items}
    </table>
  `;
}

export function renderMailContactReferenceBadge(reference: string): string {
  return `
    <p style="margin:20px 0;font-family:Arial,sans-serif;font-size:14px;line-height:1.5;color:#333;">
      <strong style="color:#2482ff;">Votre référence</strong><br />
      <span style="font-size:20px;font-weight:700;color:#1b4491;letter-spacing:0.04em;">${escapeHtml(reference)}</span>
    </p>
  `;
}

export function renderMailContactMessageBlock(title: string, content: string): string {
  return `
    <p style="margin:18px 0 8px;font-family:Arial,sans-serif;font-size:13px;font-weight:700;color:#505050;text-transform:uppercase;letter-spacing:0.06em;">
      ${escapeHtml(title)}
    </p>
    <p style="margin:0 0 16px;font-family:Arial,sans-serif;font-size:14px;line-height:1.6;color:#333;white-space:pre-wrap;background:#f2f0ee;padding:14px 16px;border-radius:6px;">
      ${escapeHtml(content)}
    </p>
  `;
}

export function renderMailContactButton(href: string, label: string): string {
  return `
    <div class="reply-button" style="text-align:center;margin:24px 0;">
      <a href="${escapeHtml(href)}" target="_blank" style="display:inline-block;background-color:#ff0c0e;color:#fff;text-decoration:none;padding:12px 25px;border-radius:30px;font-weight:bold;font-family:Arial,sans-serif;font-size:14px;">
        ${escapeHtml(label)}
      </a>
    </div>
  `;
}

export function buildMailContactHtml(options: MailContactTemplateOptions): string {
  const greeting = options.greeting?.trim() || "Bonjour,";
  const headline = options.headline?.trim();
  const paragraphs = renderParagraphs(options.paragraphs ?? []);
  const contentHtml = options.contentHtml?.trim() ?? "";
  const closing =
    options.closingHtml?.trim() ??
    `<p style="margin:0;font-family:Arial,sans-serif;font-size:14px;line-height:1.5;color:#777;">
      Cordialement,<br /><br /><strong>Équipe IGM</strong>
    </p>`;
  const button = options.button
    ? renderMailContactButton(options.button.href, options.button.label)
    : "";

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 0;
      background: #f2f0ee;
      color: #333;
    }
    .container {
      max-width: 600px;
      margin: auto;
      background: #ffffff;
      margin-top: 20px;
    }
    .header {
      text-align: center;
      padding: 30px;
    }
    .content {
      padding: 40px;
      line-height: 1.4;
    }
    .reply-button {
      text-align: center;
      margin: 20px 0;
    }
    .reply-button a {
      display: inline-block;
      background-color: #ff0c0e;
      color: #fff;
      text-decoration: none;
      padding: 12px 25px;
      border-radius: 30px;
      font-weight: bold;
    }
    .footer {
      background-color: #505050;
      color: #fff;
      text-align: center;
      padding: 25px 20px;
      font-size: 12px;
    }
    .footer a {
      color: #ffffff;
      text-decoration: none;
      margin: 0 8px;
      font-weight: 500;
    }
  </style>
</head>
<body style="background: #f8f8f8; padding-top: 20px; padding-bottom: 20px;">
  <div class="container">
    <div class="header">
      <a href="${IGM_SITE}/" target="_blank">
        <img src="${LOGO_URL}" alt="Inspection Générale des Mines" width="240" />
      </a>
    </div>
    <div class="content">
      ${headline ? `<p style="margin:0 0 18px;"><strong style="color:#2482ff;font-family:Arial,sans-serif;font-size:16px;line-height:1.4;">${escapeHtml(headline)}</strong></p>` : ""}
      <p style="margin:0 0 16px;font-family:Arial,sans-serif;font-size:15px;line-height:1.5;color:#333;"><strong>${escapeHtml(greeting)}</strong></p>
      ${paragraphs}
      ${contentHtml}
      ${button}
      ${closing}
    </div>
    <div class="footer">
      <div style="margin: 10px 0;">
        No. 4808, Avenue Tabu Ley (Ex-Tombalbaye) Golf /<br />
        Kinshasa-Gombe
      </div>
      <div>
        <a href="${IGM_SITE}/contact" target="_blank">Nous contacter</a> |
        <a href="${IGM_SITE}/actualites" target="_blank">Actualités</a> |
        <a href="${IGM_SITE}/a-propos" target="_blank">Qui sommes-nous?</a> |
        <a href="${IGM_SITE}/conditions-generales" target="_blank">Termes &amp; Conditions</a>
      </div>
    </div>
  </div>
</body>
</html>`;
}
