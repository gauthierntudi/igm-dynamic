import { getPayloadClient } from "@/lib/cms/payload";
import { sendContactNotificationEmail } from "@/lib/email/sendContactNotificationEmail";
import { getMessages } from "@/i18n/messages";
import type { SupportedLocale } from "@/i18n/locales";

export type SubmitContactMessageResult =
  | { ok: true; message: string; id: number }
  | { ok: false; error: string; status: number };

const MAX_NAME = 120;
const MAX_SUBJECT = 200;
const MAX_MESSAGE = 5000;
const MAX_PHONE = 40;

function trimOrUndefined(value: string): string | undefined {
  const trimmed = value.trim();
  return trimmed || undefined;
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isSupportedLocale(value: string): value is SupportedLocale {
  return value === "fr" || value === "en";
}

export async function submitContactMessage(
  body: Record<string, unknown>,
): Promise<SubmitContactMessageResult> {
  const localeRaw = String(body.locale ?? "fr").trim();
  const locale = isSupportedLocale(localeRaw) ? localeRaw : "fr";
  const t = getMessages(locale).contactPage.form;

  if (body._gotcha && String(body._gotcha).trim()) {
    return { ok: true, message: t.success, id: 0 };
  }

  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim();
  const phone = trimOrUndefined(String(body.phone ?? ""));
  const subject = String(body.subject ?? "").trim();
  const message = String(body.message ?? "").trim();

  if (!name) {
    return { ok: false, error: t.name, status: 400 };
  }
  if (name.length > MAX_NAME) {
    return { ok: false, error: t.errorGeneric, status: 400 };
  }
  if (!email) {
    return { ok: false, error: t.email, status: 400 };
  }
  if (!isValidEmail(email)) {
    return { ok: false, error: t.errorGeneric, status: 400 };
  }
  if (!subject) {
    return { ok: false, error: t.subject, status: 400 };
  }
  if (subject.length > MAX_SUBJECT) {
    return { ok: false, error: t.errorGeneric, status: 400 };
  }
  if (!message) {
    return { ok: false, error: t.message, status: 400 };
  }
  if (message.length > MAX_MESSAGE) {
    return { ok: false, error: t.errorGeneric, status: 400 };
  }
  if (phone && phone.length > MAX_PHONE) {
    return { ok: false, error: t.errorGeneric, status: 400 };
  }

  try {
    const payload = await getPayloadClient();

    let siteEmail: string | null = null;
    try {
      const settings = await payload.findGlobal({ slug: "site-settings", locale: "fr" });
      siteEmail =
        (typeof settings?.email === "string" && settings.email) ||
        (typeof settings?.footerContactEmail === "string" && settings.footerContactEmail) ||
        null;
    } catch {
      /* ignore settings lookup errors */
    }

    const created = await payload.create({
      collection: "contact-messages",
      data: {
        name,
        email,
        subject,
        message,
        locale,
        status: "nouveau",
        ...(phone ? { phone } : {}),
      },
    });

    const serverUrl = (process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000").replace(
      /\/$/,
      "",
    );
    const adminUrl = `${serverUrl}/admin/collections/contact-messages/${created.id}`;

    await sendContactNotificationEmail(
      {
        name,
        email,
        phone,
        subject,
        message,
        locale,
        adminUrl,
      },
      siteEmail,
    );

    return {
      ok: true,
      message: t.success,
      id: created.id,
    };
  } catch (error) {
    console.error("[contact] submit failed", error);
    return {
      ok: false,
      error: t.errorGeneric,
      status: 500,
    };
  }
}
