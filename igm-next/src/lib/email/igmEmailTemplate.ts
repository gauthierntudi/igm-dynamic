import { escapeHtml, getServerBaseUrl } from "@/lib/email/smtp";
import { getSiteOrigin } from "@/lib/seo/siteOrigin";

/** Couleurs charte IGM (site + formulaire signalement). */
export const IGM_EMAIL_BRAND = {
  blue: "#1b4491",
  red: "#e31e24",
  gold: "#f6bf0d",
  congoRed: "#e60404",
  green: "#067647",
  greenBg: "#ecfdf3",
  text: "#1c1412",
  textMuted: "#6b6460",
  textLight: "#9b9491",
  bg: "#f0eeec",
  surface: "#f5f2f0",
  card: "#ffffff",
  border: "#e2ddd9",
  font: "Arial, Helvetica, sans-serif",
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
  variant?: "default" | "success" | "alert";
};

function emailSiteOrigin(siteUrl?: string): string {
  return (siteUrl ?? getSiteOrigin()).replace(/\/$/, "") || getServerBaseUrl();
}

function logoUrl(siteUrl?: string): string {
  return `${emailSiteOrigin(siteUrl)}/assets/img/logo-color.png`;
}

function siteHomeUrl(siteUrl?: string): string {
  return emailSiteOrigin(siteUrl);
}

function variantAccent(variant: IgmEmailLayoutOptions["variant"]): string {
  if (variant === "success") return IGM_EMAIL_BRAND.green;
  if (variant === "alert") return IGM_EMAIL_BRAND.red;
  return IGM_EMAIL_BRAND.blue;
}

export function renderIgmEmailReferenceBadge(reference: string): string {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:22px 0;">
      <tr>
        <td align="center" bgcolor="${IGM_EMAIL_BRAND.surface}" style="padding:18px 20px;background-color:${IGM_EMAIL_BRAND.surface};border:1px solid ${IGM_EMAIL_BRAND.border};border-left:5px solid ${IGM_EMAIL_BRAND.red};border-radius:10px;">
          <p style="margin:0 0 6px;font-family:${IGM_EMAIL_BRAND.font};font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:${IGM_EMAIL_BRAND.textMuted};">
            Votre référence
          </p>
          <p style="margin:0;font-family:${IGM_EMAIL_BRAND.font};font-size:22px;font-weight:700;letter-spacing:0.04em;color:${IGM_EMAIL_BRAND.blue};">
            ${escapeHtml(reference)}
          </p>
        </td>
      </tr>
    </table>
  `;
}

export function renderIgmEmailSuccessBanner(message: string): string {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 20px;">
      <tr>
        <td bgcolor="${IGM_EMAIL_BRAND.greenBg}" style="padding:14px 16px;background-color:${IGM_EMAIL_BRAND.greenBg};border:1px solid #abefc6;border-radius:10px;">
          <p style="margin:0;font-family:${IGM_EMAIL_BRAND.font};font-size:14px;line-height:1.5;color:${IGM_EMAIL_BRAND.green};font-weight:600;">
            ✓ ${escapeHtml(message)}
          </p>
        </td>
      </tr>
    </table>
  `;
}

export function renderIgmEmailInfoBox(title: string, content: string): string {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:18px 0 0;">
      <tr>
        <td bgcolor="${IGM_EMAIL_BRAND.surface}" style="padding:16px 18px;background-color:${IGM_EMAIL_BRAND.surface};border:1px solid ${IGM_EMAIL_BRAND.border};border-radius:10px;">
          <p style="margin:0 0 8px;font-family:${IGM_EMAIL_BRAND.font};font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:${IGM_EMAIL_BRAND.blue};">
            ${escapeHtml(title)}
          </p>
          <p style="margin:0;font-family:${IGM_EMAIL_BRAND.font};font-size:14px;line-height:1.65;color:${IGM_EMAIL_BRAND.text};">
            ${content}
          </p>
        </td>
      </tr>
    </table>
  `;
}

export function renderIgmEmailButton(href: string, label: string): string {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:26px 0 8px;">
      <tr>
        <td align="center">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td align="center" bgcolor="${IGM_EMAIL_BRAND.blue}" style="background-color:${IGM_EMAIL_BRAND.blue};border-radius:8px;">
                <a href="${escapeHtml(href)}" target="_blank" style="display:inline-block;padding:13px 26px;font-family:${IGM_EMAIL_BRAND.font};font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:8px;">
                  ${escapeHtml(label)}
                </a>
              </td>
            </tr>
          </table>
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
          <td bgcolor="${IGM_EMAIL_BRAND.card}" style="padding:11px 0;border-bottom:1px solid ${IGM_EMAIL_BRAND.border};font-family:${IGM_EMAIL_BRAND.font};font-size:12px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;color:${IGM_EMAIL_BRAND.textMuted};width:38%;vertical-align:top;">
            ${escapeHtml(row.label)}
          </td>
          <td bgcolor="${IGM_EMAIL_BRAND.card}" style="padding:11px 0 11px 14px;border-bottom:1px solid ${IGM_EMAIL_BRAND.border};font-family:${IGM_EMAIL_BRAND.font};font-size:14px;line-height:1.5;color:${IGM_EMAIL_BRAND.text};vertical-align:top;">
            ${escapeHtml(row.value)}
          </td>
        </tr>
      `,
    )
    .join("");

  if (!items) return "";

  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:18px 0 22px;border-collapse:collapse;background-color:${IGM_EMAIL_BRAND.card};">
      ${items}
    </table>
  `;
}

export function renderIgmEmailMessageBlock(title: string, content: string): string {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:8px 0 0;">
      <tr>
        <td bgcolor="${IGM_EMAIL_BRAND.surface}" style="padding:16px 18px;background-color:${IGM_EMAIL_BRAND.surface};border:1px solid ${IGM_EMAIL_BRAND.border};border-radius:10px;">
          <p style="margin:0 0 8px;font-family:${IGM_EMAIL_BRAND.font};font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:${IGM_EMAIL_BRAND.textMuted};">
            ${escapeHtml(title)}
          </p>
          <p style="margin:0;font-family:${IGM_EMAIL_BRAND.font};font-size:14px;line-height:1.65;color:${IGM_EMAIL_BRAND.text};white-space:pre-wrap;">
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
  const variant = options.variant ?? "default";
  const accent = variantAccent(variant);

  return `<!DOCTYPE html>
<html lang="fr" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light only" />
  <meta name="supported-color-schemes" content="light only" />
  <title>${escapeHtml(options.title)}</title>
</head>
<body bgcolor="${IGM_EMAIL_BRAND.bg}" style="margin:0;padding:0;background-color:${IGM_EMAIL_BRAND.bg};-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
  <div style="display:none;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;">
    ${escapeHtml(preheader)}
  </div>
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="${IGM_EMAIL_BRAND.bg}" style="background-color:${IGM_EMAIL_BRAND.bg};">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" bgcolor="${IGM_EMAIL_BRAND.card}" style="max-width:600px;width:100%;background-color:${IGM_EMAIL_BRAND.card};border:1px solid ${IGM_EMAIL_BRAND.border};border-radius:14px;overflow:hidden;">
          <tr>
            <td bgcolor="${IGM_EMAIL_BRAND.blue}" style="background-color:${IGM_EMAIL_BRAND.blue};padding:28px 32px 22px;text-align:center;">
              <a href="${escapeHtml(home)}" target="_blank" style="text-decoration:none;">
                <img src="${escapeHtml(logoUrl(options.siteUrl))}" alt="Inspection Générale des Mines" width="220" style="display:block;margin:0 auto 14px;max-width:220px;height:auto;border:0;outline:none;text-decoration:none;" />
              </a>
              <p style="margin:0;font-family:${IGM_EMAIL_BRAND.font};font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#ffffff;opacity:0.92;">
                République Démocratique du Congo
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:0;line-height:0;font-size:0;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td width="33.33%" height="5" bgcolor="${IGM_EMAIL_BRAND.blue}" style="background-color:${IGM_EMAIL_BRAND.blue};font-size:0;line-height:0;">&nbsp;</td>
                  <td width="33.33%" height="5" bgcolor="${IGM_EMAIL_BRAND.gold}" style="background-color:${IGM_EMAIL_BRAND.gold};font-size:0;line-height:0;">&nbsp;</td>
                  <td width="33.34%" height="5" bgcolor="${IGM_EMAIL_BRAND.congoRed}" style="background-color:${IGM_EMAIL_BRAND.congoRed};font-size:0;line-height:0;">&nbsp;</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td bgcolor="${IGM_EMAIL_BRAND.card}" style="padding:30px 32px 12px;background-color:${IGM_EMAIL_BRAND.card};font-family:${IGM_EMAIL_BRAND.font};">
              ${
                eyebrow
                  ? `<p style="margin:0 0 10px;font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:${accent};">${escapeHtml(eyebrow)}</p>`
                  : ""
              }
              <h1 style="margin:0 0 18px;font-size:24px;line-height:1.25;font-weight:700;color:${IGM_EMAIL_BRAND.text};font-family:${IGM_EMAIL_BRAND.font};">
                ${escapeHtml(options.title)}
              </h1>
              ${intro}
              ${options.bodyHtml}
            </td>
          </tr>
          <tr>
            <td bgcolor="${IGM_EMAIL_BRAND.surface}" style="padding:18px 32px 26px;background-color:${IGM_EMAIL_BRAND.surface};border-top:1px solid ${IGM_EMAIL_BRAND.border};text-align:center;font-family:${IGM_EMAIL_BRAND.font};">
              <p style="margin:0 0 6px;font-size:14px;font-weight:700;color:${IGM_EMAIL_BRAND.text};">
                Inspection Générale des Mines
              </p>
              <p style="margin:0 0 12px;font-size:12px;line-height:1.5;color:${IGM_EMAIL_BRAND.textMuted};">
                République Démocratique du Congo
              </p>
              <p style="margin:0;font-size:12px;">
                <a href="${escapeHtml(home)}" target="_blank" style="color:${IGM_EMAIL_BRAND.blue};text-decoration:none;font-weight:700;">
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
