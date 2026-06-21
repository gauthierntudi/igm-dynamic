import { NextResponse } from "next/server";

const MAX_BODY_HINT = 15 * 1024 * 1024;

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

  const description = String(formData.get("description") ?? "").trim();
  if (!description) {
    return NextResponse.json(
      { ok: false, error: "Description obligatoire." },
      { status: 400 },
    );
  }

  let totalSize = 0;
  for (const [, value] of formData.entries()) {
    if (value instanceof File && value.size > 0) {
      totalSize += value.size;
    }
  }
  if (totalSize > MAX_BODY_HINT) {
    return NextResponse.json(
      { ok: false, error: "Pièces jointes trop lourdes." },
      { status: 400 },
    );
  }

  return NextResponse.json({
    ok: true,
    message: "Signalement reçu.",
  });
}
