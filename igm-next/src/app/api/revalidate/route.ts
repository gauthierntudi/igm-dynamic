import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

type RevalidateBody = {
  tags?: string[];
  paths?: string[];
};

export async function POST(request: Request) {
  const secret = process.env.REVALIDATE_SECRET?.trim();
  if (!secret) {
    return NextResponse.json({ ok: false, error: "REVALIDATE_SECRET non configuré." }, { status: 503 });
  }

  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false, error: "Non autorisé." }, { status: 401 });
  }

  let body: RevalidateBody = {};
  try {
    body = (await request.json()) as RevalidateBody;
  } catch {
    return NextResponse.json({ ok: false, error: "JSON invalide." }, { status: 400 });
  }

  const tags = body.tags ?? [];
  const paths = body.paths ?? [];

  for (const tag of tags) {
    revalidateTag(tag, "max");
  }
  for (const path of paths) {
    revalidatePath(path);
  }

  if (tags.length === 0 && paths.length === 0) {
    revalidatePath("/");
    revalidateTag("global:site-settings", "max");
  }

  return NextResponse.json({ ok: true, revalidated: { tags, paths } });
}
