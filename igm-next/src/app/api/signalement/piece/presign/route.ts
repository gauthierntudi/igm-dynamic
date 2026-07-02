import { NextResponse } from "next/server";

import { presignSignalementPieceUpload } from "@/lib/signalement/presignSignalementPieceUpload";

export const runtime = "nodejs";
export const maxDuration = 30;

type PresignBody = {
  filename?: string;
  mimeType?: string;
  filesize?: number;
};

export async function POST(request: Request) {
  let body: PresignBody;
  try {
    body = (await request.json()) as PresignBody;
  } catch {
    return NextResponse.json({ ok: false, error: "Requête invalide." }, { status: 400 });
  }

  const filename = String(body.filename ?? "").trim();
  const mimeType = String(body.mimeType ?? "application/octet-stream").trim();
  const filesize = Number(body.filesize);

  if (!filename || !Number.isFinite(filesize) || filesize <= 0) {
    return NextResponse.json({ ok: false, error: "Métadonnées fichier invalides." }, { status: 400 });
  }

  const result = await presignSignalementPieceUpload({ filename, mimeType, filesize });
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: result.status });
  }

  return NextResponse.json({
    ok: true,
    uploadUrl: result.uploadUrl,
    filename: result.filename,
    prefix: result.prefix,
    completeToken: result.completeToken,
    headers: result.headers,
  });
}
