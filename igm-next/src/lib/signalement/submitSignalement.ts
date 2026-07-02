import type { File as PayloadUploadFile } from "payload";

import { getPayloadClient } from "@/lib/cms/payload";
import { TURNSTILE_FORM_FIELD, verifyTurnstileToken } from "@/lib/security/turnstile";

import {
  buildSignalementReference,
  isAllowedSignalementMime,
  isProvinceRdc,
  isTypeInfraction,
  MAX_SIGNALEMENT_FILE_BYTES,
  MAX_SIGNALEMENT_FILES,
  MAX_SIGNALEMENT_TOTAL_BYTES,
} from "./constants";

export type SubmitSignalementResult =
  | { ok: true; message: string; reference: string; id: number }
  | { ok: false; error: string; status: number };

function trimOrUndefined(value: string): string | undefined {
  const trimmed = value.trim();
  return trimmed || undefined;
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
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

  const description = String(formData.get("description") ?? "").trim();
  if (!description) {
    return { ok: false, error: "Description obligatoire.", status: 400 };
  }

  const alerteurNom = trimOrUndefined(String(formData.get("alerteur_nom") ?? ""));
  const alerteurEmail = trimOrUndefined(String(formData.get("alerteur_email") ?? ""));
  const alerteurTel = trimOrUndefined(String(formData.get("alerteur_tel") ?? ""));

  if (alerteurEmail && !isValidEmail(alerteurEmail)) {
    return { ok: false, error: "Adresse e-mail invalide.", status: 400 };
  }

  const provinceRaw = String(formData.get("province") ?? "").trim();
  const province = provinceRaw && isProvinceRdc(provinceRaw) ? provinceRaw : undefined;

  const villeSite = trimOrUndefined(String(formData.get("ville_site") ?? ""));
  const coords = trimOrUndefined(String(formData.get("coords") ?? ""));

  const typeRaw = String(formData.get("type_infraction") ?? "").trim();
  const typeInfraction =
    typeRaw && isTypeInfraction(typeRaw) ? typeRaw : undefined;

  const files = formData
    .getAll("pieces")
    .filter((value): value is File => value instanceof File && value.size > 0);

  if (files.length > MAX_SIGNALEMENT_FILES) {
    return {
      ok: false,
      error: `Maximum ${MAX_SIGNALEMENT_FILES} fichiers.`,
      status: 400,
    };
  }

  let totalSize = 0;
  for (const file of files) {
    if (file.size > MAX_SIGNALEMENT_FILE_BYTES) {
      return { ok: false, error: "Fichier trop lourd (max 5 Mo).", status: 400 };
    }

    const mime = file.type || "application/octet-stream";
    if (!isAllowedSignalementMime(mime, file.name)) {
      return { ok: false, error: "Type de fichier non autorisé.", status: 400 };
    }

    totalSize += file.size;
  }

  if (totalSize > MAX_SIGNALEMENT_TOTAL_BYTES) {
    return { ok: false, error: "Pièces jointes trop lourdes.", status: 400 };
  }

  const payload = await getPayloadClient();
  const uploadedFileIds: number[] = [];

  try {
    for (const file of files) {
      const created = await payload.create({
        collection: "signalement-files",
        data: {},
        file: await fileToPayloadUpload(file),
      });
      uploadedFileIds.push(created.id);
    }

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
    });

    return {
      ok: true,
      message: `Signalement ${reference} reçu.`,
      reference,
      id: signalement.id,
    };
  } catch (error) {
    for (const fileId of uploadedFileIds) {
      try {
        await payload.delete({ collection: "signalement-files", id: fileId });
      } catch {
        /* ignore rollback errors */
      }
    }

    console.error("[signalement] submit failed", error);
    return {
      ok: false,
      error: "Impossible d'enregistrer le signalement. Réessayez plus tard.",
      status: 500,
    };
  }
}
