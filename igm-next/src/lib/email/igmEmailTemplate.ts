import { escapeHtml, getServerBaseUrl } from "@/lib/email/smtp";

/** Couleurs charte IGM (site + formulaire signalement). */
export const IGM_EMAIL_BRAND = {
  blue: "#1b4491",
  red: "#e31e24",
  gold: "#f6bf0d",
  congoRed: "#e60404",
  text: "#1c1412",
  textMuted: "#6b6460",
  textLight: "#9b9491",
  bg: "#f0eeec",
  surface: "#f5f2f0",
  card: "#ffffff",
  border: "#e2ddd9",
  font:
    'Inter, "Google Sans", system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif',
} as const;

export type IgmEmailMetaRow = {
  label: string;
  value: string;
};

export type IgmEmailLayoutOptions = {
  title: string;
  preheader?: string;
  eyebrow?: string;
  introHtml?: string;
  bodyHtml: string;
  siteUrl?: string;
};

function logoUrl(siteUrl?: string): string {
  const base = (siteUrl ?? getServerBaseUrl()).replace(/\/$/, "");
  return `${base}/assets/img/logo-color.png`;
}

function siteHomeUrl(siteUrl?: string): string {
  return (siteUrl ?? getServerBaseUrl()).replace(/\/$/, "") || "https://www.igmrdc.com";
}

export function renderIgmEmailReferenceBadge(reference: string): string {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:20px 0;">
      <tr>
        <td align="center" style="padding:14px 18px;background:${IGM_EMAIL_BRAND.surface};border:1px solid ${IGM_EMAIL_BRAND.border};border-left:4px solid ${IGM_EMAIL_BRAND.red};border-radius:8px;">
          <p style="margin:0 0 4px;font-family:${IGM_EMAIL_BRAND.font};font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:${IGM_EMAIL_BRAND.textMuted};">
            Référence
          </p>
          <p style="margin:0;font-family:${IGM_EMAIL_BRAND.font};font-size:20px;font-weight:700;letter-spacing:0.02em;color:${IGM_EMAIL_BRAND.blue};">
            ${escapeHtml(reference)}
          </p>
        </td>
      </tr>
    </table>
  `;
}

export function renderIgmEmailButton(href: string, label: string): string {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0 8px;">
      <tr>
        <td align="center" style="border-radius:8px;background:${IGM_EMAIL_BRAND.blue};">
          <a href="${escapeHtml(href)}" style="display:inline-block;padding:12px 22px;font-family:${IGM_EMAIL_BRAND.font};font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:8px;">
            ${escapeHtml(label)}
          </a>
        </td>
      </tr>
    </table>
  `;
}

export function renderIgmEmailMetaTable(rows: IgmEmailMetaRow[]): string {
  const items = rows
    .filter((row) => row.value.trim())
    .map(
      (row) => `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid ${IGM_EMAIL_BRAND.border};font-family:${IGM_EMAIL_BRAND.font};font-size:13px;font-weight:600;color:${IGM_EMAIL_BRAND.textMuted};width:38%;vertical-align:top;">
            ${escapeHtml(row.label)}
          </td>
          <td style="padding:10px 0 10px 12px;border-bottom:1px solid ${IGM_EMAIL_BRAND.border};font-family:${IGM_EMAIL_BRAND.font};font-size:14px;color:${IGM_EMAIL_BRAND.text};vertical-align:top;">
            ${escapeHtml(row.value)}
          </td>
        </tr>
      `,
    )
    .join("");

  if (!items) return "";

  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:16px 0 20px;border-collapse:collapse;">
      ${items}
    </table>
  `;
}

export function renderIgmEmailMessageBlock(title: string, content: string): string {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:8px 0 0;">
      <tr>
        <td style="padding:16px 18px;background:${IGM_EMAIL_BRAND.surface};border:1px solid ${IGM_EMAIL_BRAND.border};border-radius:8px;">
          <p style="margin:0 0 8px;font-family:${IGM_EMAIL_BRAND.font};font-size:12px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;color:${IGM_EMAIL_BRAND.textMuted};">
            ${escapeHtml(title)}
          </p>
          <p style="margin:0;font-family:${IGM_EMAIL_BRAND.font};font-size:14px;line-height:1.6;color:${IGM_EMAIL_BRAND.text};white-space:pre-wrap;">
            ${escapeHtml(content)}
          </p>
        </td>
      </tr>
    </table>
  `;
}

export function buildIgmEmailHtml(options: IgmEmailLayoutOptions): string {
  const home = siteHomeUrl(options.siteUrl);
  const preheader = options.preheader?.trim() || options.title;
  const eyebrow = options.eyebrow?.trim();
  const intro = options.introHtml?.trim() ?? "";

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light" />
  <title>${escapeHtml(options.title)}</title>
</head>
<body style="margin:0;padding:0;background:${IGM_EMAIL_BRAND.bg};">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
    ${escapeHtml(preheader)}
  </div>
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:${IGM_EMAIL_BRAND.bg};">
    <tr>
      <td align="center" style="padding:28px 16px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px;width:100%;background:${IGM_EMAIL_BRAND.card};border:1px solid ${IGM_EMAIL_BRAND.border};border-radius:12px;overflow:hidden;">
          <tr>
            <td style="background:${IGM_EMAIL_BRAND.blue};padding:24px 28px 0;text-align:center;">
              <a href="${escapeHtml(home)}" style="text-decoration:none;">
                <img src="${escapeHtml(logoUrl(options.siteUrl))}" alt="Inspection Générale des Mines" width="200" style="display:block;margin:0 auto 18px;max-width:200px;height:auto;border:0;" />
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding:0;line-height:0;font-size:0;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td width="33.33%" height="4" style="background:${IGM_EMAIL_BRAND.blue};font-size:0;line-height:0;">&nbsp;</td>
                  <td width="33.33%" height="4" style="background:${IGM_EMAIL_BRAND.gold};font-size:0;line-height:0;">&nbsp;</td>
                  <td width="33.34%" height="4" style="background:${IGM_EMAIL_BRAND.congoRed};font-size:0;line-height:0;">&nbsp;</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 28px 8px;font-family:${IGM_EMAIL_BRAND.font};">
              ${
                eyebrow
                  ? `<p style="margin:0 0 8px;font-size:11px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:${IGM_EMAIL_BRAND.red};">${escapeHtml(eyebrow)}</p>`
                  : ""
              }
              <h1 style="margin:0 0 16px;font-size:22px;line-height:1.3;font-weight:700;color:${IGM_EMAIL_BRAND.text};">
                ${escapeHtml(options.title)}
              </h1>
              ${intro}
              ${options.bodyHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:16px 28px 24px;background:${IGM_EMAIL_BRAND.surface};border-top:1px solid ${IGM_EMAIL_BRAND.border};text-align:center;font-family:${IGM_EMAIL_BRAND.font};">
              <p style="margin:0 0 6px;font-size:13px;font-weight:600;color:${IGM_EMAIL_BRAND.text};">
                Inspection Générale des Mines
              </p>
              <p style="margin:0 0 10px;font-size:12px;color:${IGM_EMAIL_BRAND.textMuted};">
                République Démocratique du Congo
              </p>
              <p style="margin:0;font-size:12px;">
                <a href="${escapeHtml(home)}" style="color:${IGM_EMAIL_BRAND.blue};text-decoration:none;font-weight:600;">
                  ${escapeHtml(home.replace(/^https?:\/\//, ""))}
                </a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function buildIgmEmailTextFooter(): string {
  return [
    "",
    "—",
    "Inspection Générale des Mines",
    "République Démocratique du Congo",
    siteHomeUrl(),
  ].join("\n");
}
