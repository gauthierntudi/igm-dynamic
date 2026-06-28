import { NextResponse } from "next/server";

import { answerChatQuestion } from "@/lib/chat/answerQuestion";
import { isSupportedLocale, type SupportedLocale } from "@/i18n/locales";
import { isCmsConfigured } from "@/lib/cms/client";

export const runtime = "nodejs";
export const maxDuration = 30;

type ChatRequestBody = {
  message?: string;
  locale?: string;
};

export async function POST(request: Request) {
  if (!isCmsConfigured()) {
    return NextResponse.json(
      { error: "Assistant indisponible." },
      { status: 503 },
    );
  }

  let body: ChatRequestBody;
  try {
    body = (await request.json()) as ChatRequestBody;
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const message = typeof body.message === "string" ? body.message.trim() : "";
  if (!message || message.length > 800) {
    return NextResponse.json({ error: "Message invalide." }, { status: 400 });
  }

  const locale: SupportedLocale =
    typeof body.locale === "string" && isSupportedLocale(body.locale) ? body.locale : "fr";

  const result = await answerChatQuestion(locale, message);

  return NextResponse.json({
    answer: result.answer,
    sources: result.sources,
  });
}
