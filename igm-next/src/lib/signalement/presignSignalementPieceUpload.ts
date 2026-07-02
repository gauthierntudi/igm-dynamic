import { HeadObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { createLocalReq } from "payload";

import { getPayloadClient } from "@/lib/cms/payload";
import { s3MediaBucket, s3MediaClient } from "@/lib/s3MediaClient";

import {
  buildSignalementStorageFilename,
  createSignalementPiecePresignToken,
  verifySignalementPiecePresignToken,
} from "./signalementPiecePresignToken";
import {
  buildSignalementS3ObjectKey,
  isSignalementS3DirectUploadEnabled,
} from "./signalementS3DirectUpload";
import { validateSignalementFile } from "./validateSignalementFile";

const PRESIGN_EXPIRES_SECONDS = 600;

export type PresignSignalementPieceInput = {
  filename: string;
  mimeType: string;
  filesize: number;
};

export type PresignSignalementPieceResult =
  | {
      ok: true;
      uploadUrl: string;
      filename: string;
      prefix: string;
      completeToken: string;
      headers: { "Content-Type": string };
    }
  | { ok: false; error: string; status: number };

export async function presignSignalementPieceUpload(
  input: PresignSignalementPieceInput,
): Promise<PresignSignalementPieceResult> {
  if (!isSignalementS3DirectUploadEnabled()) {
    return { ok: false, error: "Upload direct indisponible.", status: 503 };
  }

  const validation = validateSignalementFile({
    name: input.filename,
    type: input.mimeType,
    size: input.filesize,
  });
  if (!validation.ok) {
    return { ok: false, error: validation.error, status: 400 };
  }

  const sanitizedFilename = buildSignalementStorageFilename(input.filename);
  const prefix = "";
  const fileKey = buildSignalementS3ObjectKey(sanitizedFilename, prefix);

  const completeToken = createSignalementPiecePresignToken({
    filename: sanitizedFilename,
    prefix,
    mimeType: input.mimeType,
    filesize: input.filesize,
  });
  if (!completeToken) {
    return { ok: false, error: "Configuration serveur incomplète.", status: 500 };
  }

  try {
    const client = s3MediaClient();
    const bucket = s3MediaBucket();
    const uploadUrl = await getSignedUrl(
      client,
      new PutObjectCommand({
        Bucket: bucket,
        Key: fileKey,
        ContentType: input.mimeType,
      }),
      {
        expiresIn: PRESIGN_EXPIRES_SECONDS,
      },
    );

    return {
      ok: true,
      uploadUrl,
      filename: sanitizedFilename,
      prefix,
      completeToken,
      headers: {
        "Content-Type": input.mimeType,
      },
    };
  } catch (error) {
    console.error("[signalement] presign failed", error);
    return { ok: false, error: "Impossible de préparer l’envoi.", status: 500 };
  }
}

export type CompleteSignalementPieceInput = {
  completeToken: string;
};

export type CompleteSignalementPieceResult =
  | { ok: true; id: number }
  | { ok: false; error: string; status: number };

export async function completeSignalementPieceUpload(
  input: CompleteSignalementPieceInput,
): Promise<CompleteSignalementPieceResult> {
  if (!isSignalementS3DirectUploadEnabled()) {
    return { ok: false, error: "Upload direct indisponible.", status: 503 };
  }

  const token = verifySignalementPiecePresignToken(input.completeToken);
  if (!token) {
    return { ok: false, error: "Jeton d’upload invalide ou expiré.", status: 400 };
  }

  const fileKey = buildSignalementS3ObjectKey(token.filename, token.prefix);

  try {
    const client = s3MediaClient();
    const bucket = s3MediaBucket();
    const head = await client.send(
      new HeadObjectCommand({
        Bucket: bucket,
        Key: fileKey,
      }),
    );

    const objectSize = head.ContentLength ?? 0;
    if (objectSize !== token.filesize) {
      return { ok: false, error: "Taille du fichier incorrecte.", status: 400 };
    }

    const payload = await getPayloadClient();
    const req = await createLocalReq({ context: { skipCloudStorage: true } }, payload);
    const created = await payload.db.create({
      collection: "signalement-files",
      data: {
        filename: token.filename,
        mimeType: token.mimeType,
        filesize: token.filesize,
        ...(token.prefix ? { prefix: token.prefix } : {}),
      },
      req,
    });

    return { ok: true, id: created.id as number };
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "name" in error &&
      error.name === "NotFound"
    ) {
      return { ok: false, error: "Fichier introuvable. Réessayez l’envoi.", status: 400 };
    }

    console.error("[signalement] complete failed", error);
    return {
      ok: false,
      error: "Impossible d’enregistrer le fichier. Réessayez.",
      status: 500,
    };
  }
}
