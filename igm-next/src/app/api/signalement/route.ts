import { NextResponse } from "next/server";

import { submitSignalement } from "@/lib/signalement/submitSignalement";

export const runtime = "nodejs";
export const maxDuration = 60;

function clientIpFromRequest(request: Request): string | undefined {
  const cf = request.headers.get("cf-connecting-ip")?.trim();
  if (cf) return cf;
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || undefined;
}

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") || "";
  if (!contentType.includes("multipart/form-data")) {
    return NextResponse.json(
      { ok: false, error: "Format invalide." },
      { status: 400 },
    );
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

  const result = await submitSignalement(formData, {
    remoteIp: clientIpFromRequest(request),
  });

  if (!result.ok) {
    return NextResponse.json(
      { ok: false, error: result.error },
      { status: result.status },
    );
  }

  return NextResponse.json({
    ok: true,
    message: result.message,
    reference: result.reference,
    id: result.id,
  });
}
