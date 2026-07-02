import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";

import { sanitizeFilename } from "payload/shared";

const TOKEN_TTL_MS = 15 * 60 * 1000;

export type SignalementPiecePresignToken = {
  filename: string;
  prefix: string;
  mimeType: string;
  filesize: number;
  exp: number;
};

function presignTokenSecret(): string | null {
  const secret = process.env.PAYLOAD_SECRET?.trim();
  return secret || null;
}

function encodeTokenPayload(payload: SignalementPiecePresignToken): string {
  return Buffer.from(JSON.stringify(payload)).toString("base64url");
}

export function createSignalementPiecePresignToken(
  data: Omit<SignalementPiecePresignToken, "exp">,
): string | null {
  const secret = presignTokenSecret();
  if (!secret) {
    return null;
  }

  const payload: SignalementPiecePresignToken = {
    ...data,
    exp: Date.now() + TOKEN_TTL_MS,
  };
  const body = encodeTokenPayload(payload);
  const signature = createHmac("sha256", secret).update(body).digest("base64url");
  return `${body}.${signature}`;
}

export function verifySignalementPiecePresignToken(
  token: string,
): SignalementPiecePresignToken | null {
  const secret = presignTokenSecret();
  if (!secret) {
    return null;
  }

  const [body, signature] = token.split(".");
  if (!body || !signature) {
    return null;
  }

  const expected = createHmac("sha256", secret).update(body).digest("base64url");
  const sigBuf = Buffer.from(signature);
  const expectedBuf = Buffer.from(expected);
  if (sigBuf.length !== expectedBuf.length || !timingSafeEqual(sigBuf, expectedBuf)) {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(body, "base64url").toString("utf8"),
    ) as SignalementPiecePresignToken;

    if (
      !payload.filename ||
      typeof payload.filesize !== "number" ||
      !payload.mimeType ||
      typeof payload.exp !== "number" ||
      payload.exp < Date.now()
    ) {
      return null;
    }

    return {
      filename: payload.filename,
      prefix: payload.prefix || "",
      mimeType: payload.mimeType,
      filesize: payload.filesize,
      exp: payload.exp,
    };
  } catch {
    return null;
  }
}

export function buildSignalementStorageFilename(originalName: string): string {
  const safeName = sanitizeFilename(originalName || "piece");
  const extensionMatch = safeName.match(/(\.[^.]+)$/);
  const extension = extensionMatch?.[1]?.toLowerCase() ?? "";
  return `${randomUUID()}${extension}`;
}
