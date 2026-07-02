import { NextResponse } from "next/server";

import { completeSignalementPieceUpload } from "@/lib/signalement/presignSignalementPieceUpload";

export const runtime = "nodejs";
export const maxDuration = 30;

type CompleteBody = {
  completeToken?: string;
};

export async function POST(request: Request) {
  let body: CompleteBody;
  try {
    body = (await request.json()) as CompleteBody;
  } catch {
    return NextResponse.json({ ok: false, error: "Requête invalide." }, { status: 400 });
  }

  const completeToken = String(body.completeToken ?? "").trim();
  if (!completeToken) {
    return NextResponse.json({ ok: false, error: "Jeton manquant." }, { status: 400 });
  }

  const result = await completeSignalementPieceUpload({ completeToken });
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: result.status });
  }

  return NextResponse.json({ ok: true, id: result.id });
}
