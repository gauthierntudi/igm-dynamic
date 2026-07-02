import { NextResponse } from "next/server";

import { getPayloadClient } from "@/lib/cms/payload";
import { cleanupOrphanSignalementPieces } from "@/lib/signalement/cleanupOrphanSignalementPieces";
import { verifyCronSecret } from "@/lib/security/verifyCronSecret";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(request: Request) {
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ ok: false, error: "Non autorisé." }, { status: 401 });
  }

  try {
    const payload = await getPayloadClient();
    const result = await cleanupOrphanSignalementPieces(payload);

    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error("[cron] cleanup-signalement-pieces failed", error);
    return NextResponse.json(
      { ok: false, error: "Échec du nettoyage." },
      { status: 500 },
    );
  }
}
