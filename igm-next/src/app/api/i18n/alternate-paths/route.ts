import { resolveAlternateLocaleHrefs } from "@/lib/i18n/resolveLocaleHref";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const pathname = searchParams.get("pathname")?.trim() || "/";

  try {
    const hrefs = await resolveAlternateLocaleHrefs(pathname);
    return NextResponse.json({ hrefs });
  } catch (err) {
    console.error("[i18n] alternate-paths:", err);
    return NextResponse.json({ error: "Failed to resolve alternate paths" }, { status: 500 });
  }
}
