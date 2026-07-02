import { NextResponse } from "next/server";

import { uploadSignalementPiece } from "@/lib/signalement/uploadSignalementPiece";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") || "";
  if (!contentType.includes("multipart/form-data")) {
    return NextResponse.json({ ok: false, error: "Format invalide." }, { status: 400 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Requête invalide ou trop lourde." },
      { status: 400 },
    );
  }

  const piece = formData.get("piece");
  if (!(piece instanceof File)) {
    return NextResponse.json({ ok: false, error: "Fichier manquant." }, { status: 400 });
  }

  const result = await uploadSignalementPiece(piece);
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: result.status });
  }

  return NextResponse.json({ ok: true, id: result.id });
}
