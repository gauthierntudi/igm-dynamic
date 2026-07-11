import type { File as PayloadUploadFile } from "payload";

import { getPayloadClient } from "@/lib/cms/payload";
import { sendSignalementSubmissionEmails } from "@/lib/email/sendSignalementEmails";
import {
  getSignalementAcknowledgementCopy,
  resolveSignalementLocale,
} from "@/lib/email/signalementEmailCopy";
import { getSignalementFormCopy } from "@/lib/signalement/signalementFormCopy";
import { TURNSTILE_FORM_FIELD, verifyTurnstileToken } from "@/lib/security/turnstile";

import { assertOrphanSignalementPieces } from "./assertOrphanSignalementPieces";
import {
  buildSignalementReference,
  isProvinceRdc,
  isTypeInfraction,
  MAX_SIGNALEMENT_FILES,
  MAX_SIGNALEMENT_TOTAL_BYTES,
} from "./constants";
import { validateSignalementFile } from "./validateSignalementFile";

export type SubmitSignalementResult =
  | {
      ok: true;
      message: string;
      reference: string;
      id: number;
      emails: { adminNotified: boolean; acknowledgementSent: boolean };
    }
  | { ok: false; error: string; status: number };

function trimOrUndefined(value: string): string | undefined {
  const trimmed = value.trim();
  return trimmed || undefined;
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function parsePieceIds(formData: FormData): number[] {
  return formData
    .getAll("piece_ids")
    .map((value) => Number(String(value)))
    .filter((id) => Number.isInteger(id) && id > 0);
}

async function fileToPayloadUpload(file: File): Promise<PayloadUploadFile> {
  const buffer = Buffer.from(await file.arrayBuffer());
  return {
    data: buffer,
    mimetype: file.type || "application/octet-stream",
    name: file.name,
    size: file.size,
  };
}

async function uploadPiecesFromFormData(files: File[]): Promise<
  | { ok: true; ids: number[] }
  | { ok: false; error: string; status: number }
> {
  if (files.length > MAX_SIGNALEMENT_FILES) {
    return {
      ok: false,
      error: `Maximum ${MAX_SIGNALEMENT_FILES} fichiers.`,
      status: 400,
    };
  }

  let totalSize = 0;
  for (const file of files) {
    const validation = validateSignalementFile(file);
    if (!validation.ok) {
      return { ok: false, error: validation.error, status: 400 };
    }
    totalSize += file.size;
  }

  if (totalSize > MAX_SIGNALEMENT_TOTAL_BYTES) {
    return { ok: false, error: "Pièces jointes trop lourdes.", status: 400 };
  }

  const payload = await getPayloadClient();
  const uploadedFileIds: number[] = [];

  try {
    const created = await Promise.all(
      files.map(async (file) =>
        payload.create({
          collection: "signalement-files",
          data: {},
          file: await fileToPayloadUpload(file),
          overrideAccess: true,
        }),
      ),
    );
    uploadedFileIds.push(...created.map((doc) => doc.id));
    return { ok: true, ids: uploadedFileIds };
  } catch (error) {
    for (const fileId of uploadedFileIds) {
      try {
        await payload.delete({ collection: "signalement-files", id: fileId, overrideAccess: true });
      } catch {
        /* ignore rollback errors */
      }
    }
    console.error("[signalement] legacy piece upload failed", error);
    return {
      ok: false,
      error: "Impossible d’enregistrer les fichiers. Réessayez.",
      status: 500,
    };
  }
}

export async function submitSignalement(
  formData: FormData,
  options: { remoteIp?: string | null } = {},
): Promise<SubmitSignalementResult> {
  const captcha = await verifyTurnstileToken(
    String(formData.get(TURNSTILE_FORM_FIELD) ?? ""),
    options.remoteIp,
  );
  if (!captcha.ok) {
    return { ok: false, error: captcha.error, status: 400 };
  }

  const locale = resolveSignalementLocale(String(formData.get("locale") ?? "fr"));
  const copy = getSignalementFormCopy(locale);

  const description = String(formData.get("description") ?? "").trim();
  if (!description) {
    return { ok: false, error: copy.validation.descriptionRequired, status: 400 };
  }

  const alerteurNom = trimOrUndefined(String(formData.get("alerteur_nom") ?? ""));
  const alerteurEmail = trimOrUndefined(String(formData.get("alerteur_email") ?? ""));
  const alerteurTel = trimOrUndefined(String(formData.get("alerteur_tel") ?? ""));

  if (alerteurEmail && !isValidEmail(alerteurEmail)) {
    return { ok: false, error: copy.validation.emailInvalid, status: 400 };
  }

  const provinceRaw = String(formData.get("province") ?? "").trim();
  const province = provinceRaw && isProvinceRdc(provinceRaw) ? provinceRaw : undefined;

  const villeSite = trimOrUndefined(String(formData.get("ville_site") ?? ""));
  const coords = trimOrUndefined(String(formData.get("coords") ?? ""));

  const typeRaw = String(formData.get("type_infraction") ?? "").trim();
  const typeInfraction =
    typeRaw && isTypeInfraction(typeRaw) ? typeRaw : undefined;

  const pieceIds = parsePieceIds(formData);
  const inlineFiles = formData
    .getAll("pieces")
    .filter((value): value is File => value instanceof File && value.size > 0);

  if (pieceIds.length > 0 && inlineFiles.length > 0) {
    return {
      ok: false,
      error: copy.toast.duplicateFiles,
      status: 400,
    };
  }

  const payload = await getPayloadClient();
  let uploadedFileIds: number[] = [];

  if (pieceIds.length > 0) {
    if (pieceIds.length > MAX_SIGNALEMENT_FILES) {
      return {
        ok: false,
        error: copy.toast.maxFilesServer(MAX_SIGNALEMENT_FILES),
        status: 400,
      };
    }

    const orphanCheck = await assertOrphanSignalementPieces(payload, pieceIds);
    if (!orphanCheck.ok) {
      return { ok: false, error: orphanCheck.error, status: 400 };
    }

    uploadedFileIds = pieceIds;
  } else if (inlineFiles.length > 0) {
    const upload = await uploadPiecesFromFormData(inlineFiles);
    if (!upload.ok) {
      return upload;
    }
    uploadedFileIds = upload.ids;
  }

  try {
    const estAnonyme = !alerteurNom && !alerteurEmail && !alerteurTel;
    const reference = buildSignalementReference();

    const signalement = await payload.create({
      collection: "signalements",
      data: {
        reference,
        estAnonyme,
        status: "recu",
        description,
        ...(province ? { province } : {}),
        ...(villeSite ? { villeSite } : {}),
        ...(coords ? { coords } : {}),
        ...(typeInfraction ? { typeInfraction } : {}),
        ...(alerteurNom || alerteurEmail || alerteurTel
          ? {
              alerteur: {
                ...(alerteurNom ? { nom: alerteurNom } : {}),
                ...(alerteurEmail ? { email: alerteurEmail } : {}),
                ...(alerteurTel ? { tel: alerteurTel } : {}),
              },
            }
          : {}),
        ...(uploadedFileIds.length ? { pieces: uploadedFileIds } : {}),
      },
      overrideAccess: true,
    });

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

    const emailResult = await sendSignalementSubmissionEmails(
      {
        id: signalement.id,
        reference,
        description,
        estAnonyme,
        alerteurNom,
        alerteurEmail,
        alerteurTel,
        province,
        villeSite,
        coords,
        typeInfraction,
        pieceCount: uploadedFileIds.length,
        locale,
      },
      siteEmail,
    );

    const copy = getSignalementAcknowledgementCopy(locale);
    const message = copy.receivedMessage(reference, emailResult.acknowledgementSent);

    return {
      ok: true,
      message,
      reference,
      id: signalement.id,
      emails: {
        adminNotified: emailResult.adminNotified,
        acknowledgementSent: emailResult.acknowledgementSent,
      },
    };
  } catch (error) {
    if (inlineFiles.length > 0) {
      for (const fileId of uploadedFileIds) {
        try {
          await payload.delete({ collection: "signalement-files", id: fileId, overrideAccess: true });
        } catch {
          /* ignore rollback errors */
        }
      }
    }

    console.error("[signalement] submit failed", error);
    return {
      ok: false,
      error: copy.toast.uploadFailed,
      status: 500,
    };
  }
}
