import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  generateText,
  streamText,
  toUIMessageStream,
  type UIMessage,
  type UIMessageStreamWriter,
} from "ai";

import { isCmsConfigured } from "@/lib/cms/client";
import {
  getLastUserText,
  getPriorUserTexts,
  writeSourceParts,
  writeTextAnswer,
} from "@/lib/chat/chatMessageUtils";
import { listChatModelCandidates, type ChatModelCandidate } from "@/lib/chat/chatModel";
import type { ChatSource } from "@/lib/chat/faqAnswers";
import { prepareChatContext } from "@/lib/chat/prepareChatContext";
import { isSupportedLocale, type SupportedLocale } from "@/i18n/locales";

export const runtime = "nodejs";
export const maxDuration = 30;

type ChatRequestBody = {
  messages?: UIMessage[];
  locale?: string;
};

function logLlmFailure(provider: string, modelId: string, error: unknown): void {
  const detail = error instanceof Error ? error.message : String(error);
  console.warn(`[chat] LLM ${provider}/${modelId} indisponible:`, detail.slice(0, 200));
}

async function probeChatModel(
  candidate: ChatModelCandidate,
  modelMessages: Awaited<ReturnType<typeof convertToModelMessages>>,
  systemPrompt: string,
): Promise<boolean> {
  try {
    await generateText({
      model: candidate.model,
      system: systemPrompt,
      messages: modelMessages,
      maxRetries: 0,
      maxOutputTokens: 1,
    });
    return true;
  } catch (error) {
    logLlmFailure(candidate.provider, candidate.modelId, error);
    return false;
  }
}

async function tryStreamLlmAnswer(
  writer: UIMessageStreamWriter,
  messages: UIMessage[],
  systemPrompt: string,
): Promise<boolean> {
  const modelMessages = await convertToModelMessages(messages);
  const candidates = listChatModelCandidates();

  let selectedCandidate: ChatModelCandidate | null = null;

  if (candidates.length > 1) {
    for (const candidate of candidates) {
      if (await probeChatModel(candidate, modelMessages, systemPrompt)) {
        selectedCandidate = candidate;
        break;
      }
    }
  } else {
    selectedCandidate = candidates[0] ?? null;
  }

  if (!selectedCandidate) {
    return false;
  }

  try {
    const result = streamText({
      model: selectedCandidate.model,
      system: systemPrompt,
      messages: modelMessages,
        temperature: 0.35,
      maxRetries: 0,
    });

    writer.merge(
      toUIMessageStream({
        stream: result.stream,
        sendStart: false,
        sendFinish: false,
      }),
    );
    await result.text;
    return true;
  } catch (error) {
    logLlmFailure(selectedCandidate.provider, selectedCandidate.modelId, error);
    return false;
  }
}

function writeAssistantAnswer(
  writer: UIMessageStreamWriter,
  text: string,
  sources: ChatSource[],
): void {
  writeTextAnswer(writer, text);
  if (sources.length > 0) {
    writeSourceParts(writer, sources);
  }
}

export async function POST(request: Request) {
  if (!isCmsConfigured()) {
    return new Response(JSON.stringify({ error: "Assistant indisponible." }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }

  let body: ChatRequestBody;
  try {
    body = (await request.json()) as ChatRequestBody;
  } catch {
    return new Response(JSON.stringify({ error: "Requête invalide." }), { status: 400 });
  }

  const messages = Array.isArray(body.messages) ? body.messages : [];
  const question = getLastUserText(messages);

  if (!question || question.length > 800) {
    return new Response(JSON.stringify({ error: "Message invalide." }), { status: 400 });
  }

  const locale: SupportedLocale =
    typeof body.locale === "string" && isSupportedLocale(body.locale) ? body.locale : "fr";

  const prepared = await prepareChatContext(locale, question, {
    priorUserQuestions: getPriorUserTexts(messages),
  });

  const stream = createUIMessageStream({
    originalMessages: messages,
    execute: async ({ writer }) => {
      if (prepared.directAnswer) {
        writeAssistantAnswer(writer, prepared.directAnswer, prepared.sources);
        return;
      }

      const streamed = await tryStreamLlmAnswer(writer, messages, prepared.systemPrompt);
      if (streamed) {
        if (prepared.sources.length > 0) {
          writeSourceParts(writer, prepared.sources);
        }
        return;
      }

      writeAssistantAnswer(writer, prepared.fallbackAnswer, prepared.sources);
    },
    onError: (error) => {
      logLlmFailure("stream", "ui", error);
      return "";
    },
  });

  return createUIMessageStreamResponse({ stream });
}
