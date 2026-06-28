import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { getPayloadClient } from "@/lib/cms/payload";
import { fetchSignalementFileBuffer } from "@/lib/signalement/fetchSignalementFileBuffer";
import {
  buildSignalementPdfBuffer,
  signalementPdfFilename,
  type SignalementPdfAttachment,
} from "@/lib/signalement/signalementPdf";
import type { Signalement, SignalementFile } from "@/payload-types";

export const runtime = "nodejs";
export const maxDuration = 60;

function isPopulatedFile(value: unknown): value is SignalementFile {
  return Boolean(value && typeof value === "object" && "id" in value);
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const numericId = Number(id);
  if (!Number.isFinite(numericId)) {
    return NextResponse.json({ error: "Identifiant invalide." }, { status: 400 });
  }

  const payload = await getPayloadClient();
  const headerList = await headers();
  const { user } = await payload.auth({ headers: headerList });

  if (!user) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  let signalement: Signalement;
  try {
    signalement = (await payload.findByID({
      collection: "signalements",
      id: numericId,
      depth: 2,
      user,
      overrideAccess: false,
    })) as Signalement;
  } catch {
    return NextResponse.json({ error: "Signalement introuvable." }, { status: 404 });
  }

  const apiRoute = payload.config.routes?.api || "/api";
  const cookieHeader = headerList.get("cookie");
  const host = headerList.get("x-forwarded-host") ?? headerList.get("host");
  const protocol = headerList.get("x-forwarded-proto") ?? "http";
  const origin = host ? `${protocol}://${host}` : null;

  const rawPieces = Array.isArray(signalement.pieces) ? signalement.pieces : [];
  const files = rawPieces.filter(isPopulatedFile);

  const attachments: SignalementPdfAttachment[] = await Promise.all(
    files.map(async (file) => {
      const mime = file.mimeType ?? "";
      if (!mime.startsWith("image/")) {
        return { ...file, buffer: null };
      }

      const buffer = await fetchSignalementFileBuffer(file, {
        apiRoute,
        cookieHeader,
        origin,
      });

      return { ...file, buffer };
    }),
  );

  const pdfBuffer = await buildSignalementPdfBuffer(signalement, attachments);
  const filename = signalementPdfFilename(signalement, id);

  return new NextResponse(new Uint8Array(pdfBuffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
