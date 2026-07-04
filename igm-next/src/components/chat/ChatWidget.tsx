"use client";

import { useChat } from "@ai-sdk/react";
import {
  DefaultChatTransport,
  type UIMessage,
} from "ai";
import {
  ExternalLink,
  MessageCircleQuestionMark,
  SendHorizontal,
  X,
} from "lucide-react";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { useLocale } from "@/components/i18n/LocaleProvider";
import {
  getMessageSources,
  getMessageText,
} from "@/lib/chat/chatMessageUtils";
import { getFaqAnswerById, getFaqSuggestions, matchFaqAnswer } from "@/lib/chat/faqAnswers";
import { withDeployedBase } from "@/lib/deployBasePath";

import styles from "./chatWidget.module.css";

const COPY = {
  fr: {
    open: "Ouvrir l'assistant IGM",
    close: "Fermer",
    title: "Assistant IGM",
    subtitle: "Questions sur le site et nos missions",
    placeholder: "Posez votre question…",
    send: "Envoyer",
    thinking: "Recherche en cours",
    welcome:
      "Bonjour ! Je suis l'assistant IGM. Posez-moi vos questions sur nos missions, la cartographie, les actualités ou le signalement.",
    error: "Impossible de répondre pour le moment. Réessayez.",
    sources: "En savoir plus",
  },
  en: {
    open: "Open IGM assistant",
    close: "Close",
    title: "IGM assistant",
    subtitle: "Questions about the website and our missions",
    placeholder: "Ask your question…",
    send: "Send",
    thinking: "Searching",
    welcome:
      "Hello! I'm the IGM assistant. Ask me about our missions, the map, news or reporting.",
    error: "Unable to answer right now. Please try again.",
    sources: "Learn more",
  },
} as const;

function createId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function createAssistantMessage(text: string, sources?: Array<{ title: string; url: string }>): UIMessage {
  return {
    id: createId(),
    role: "assistant",
    parts: [
      { type: "text", text },
      ...(sources ?? []).map((source) => ({
        type: "source-url" as const,
        sourceId: source.url,
        url: source.url,
        title: source.title,
      })),
    ],
  };
}

export default function ChatWidget() {
  const { locale } = useLocale();
  const copy = COPY[locale];
  const suggestions = getFaqSuggestions(locale);
  const titleId = useId();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: withDeployedBase("/api/chat"),
        body: { locale },
      }),
    [locale],
  );

  const {
    messages,
    sendMessage,
    setMessages,
    status,
    error,
  } = useChat({
    id: `igm-assistant-${locale}`,
    transport,
  });

  const loading = status === "submitted" || status === "streaming";
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setMessages([]);
    setInput("");
  }, [locale, setMessages]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    inputRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    const node = listRef.current;
    if (!node) return;
    node.scrollTop = node.scrollHeight;
  }, [messages, loading, isOpen, error]);

  const sendQuestion = useCallback(
    async (text?: string, faqId?: string) => {
      const question = (text ?? input).trim();
      if (!question || loading) return;

      const faqAnswer =
        faqId && faqId !== "green-number"
          ? getFaqAnswerById(locale, faqId)
          : faqId
            ? null
            : matchFaqAnswer(locale, question);

      setInput("");

      if (faqAnswer) {
        setMessages((current) => [
          ...current,
          {
            id: createId(),
            role: "user",
            parts: [{ type: "text", text: question }],
          },
          createAssistantMessage(faqAnswer.answer, faqAnswer.sources),
        ]);
        return;
      }

      await sendMessage({
        parts: [{ type: "text", text: question }],
      });
    },
    [input, loading, locale, sendMessage, setMessages],
  );

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    void sendQuestion();
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void sendQuestion();
    }
  };

  const showSuggestions = messages.length === 0 && !loading;

  if (!mounted) return null;

  return createPortal(
    <div className={styles.root}>
      {isOpen ? (
        <section
          className={styles.panel}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
        >
          <header className={styles.header}>
            <div className={styles.headerBrand}>
              <span className={styles.headerIcon} aria-hidden="true">
                <MessageCircleQuestionMark size={20} strokeWidth={2} />
              </span>
              <div>
                <h2 className={styles.title} id={titleId}>
                  {copy.title}
                </h2>
                <span className={styles.subtitle}>{copy.subtitle}</span>
              </div>
            </div>
            <button
              type="button"
              className={styles.closeBtn}
              onClick={() => setIsOpen(false)}
              aria-label={copy.close}
            >
              <X size={18} strokeWidth={2} />
            </button>
          </header>
          <div className={styles.tricolorStripe} aria-hidden="true" />

          <div className={styles.messages} ref={listRef}>
            <article className={styles.messageRowBot}>
              <span className={styles.avatar} aria-hidden="true">
                <MessageCircleQuestionMark size={16} strokeWidth={2} />
              </span>
              <div className={styles.messageBot}>
                <div className={styles.messageText}>{copy.welcome}</div>
              </div>
            </article>

            {messages.map((message) => {
              const text = getMessageText(message);
              const sources = getMessageSources(message);

              if (message.role === "assistant" && !text && sources.length > 0) {
                return null;
              }

              return (
                <article
                  key={message.id}
                  className={
                    message.role === "user"
                      ? styles.messageRowUser
                      : styles.messageRowBot
                  }
                >
                  {message.role === "assistant" ? (
                    <span className={styles.avatar} aria-hidden="true">
                      <MessageCircleQuestionMark size={16} strokeWidth={2} />
                    </span>
                  ) : null}
                  <div
                    className={
                      message.role === "user"
                        ? styles.messageUser
                        : styles.messageBot
                    }
                  >
                    {text ? <div className={styles.messageText}>{text}</div> : null}
                    {text && sources.length > 0 ? (
                      <div className={styles.sources}>
                        <p className={styles.sourcesLabel}>{copy.sources}</p>
                        <ul className={styles.sourcesList}>
                          {sources.map((source) => (
                            <li key={`${message.id}-${source.url}`}>
                              <a href={withDeployedBase(source.url)} className={styles.sourceLink}>
                                <span>{source.title}</span>
                                <ExternalLink size={12} strokeWidth={2} />
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </div>
                </article>
              );
            })}

            {loading ? (
              <div className={styles.messageRowBot}>
                <span className={styles.avatar} aria-hidden="true">
                  <MessageCircleQuestionMark size={16} strokeWidth={2} />
                </span>
                <div className={styles.typingBubble}>
                  <span className={styles.thinkingLabel}>{copy.thinking}</span>
                  <span className={styles.typingDots} aria-hidden="true">
                    <span />
                    <span />
                    <span />
                  </span>
                </div>
              </div>
            ) : null}

            {error ? (
              <div className={styles.messageRowBot}>
                <span className={styles.avatar} aria-hidden="true">
                  <MessageCircleQuestionMark size={16} strokeWidth={2} />
                </span>
                <div className={styles.messageBot}>
                  <div className={styles.messageText}>{copy.error}</div>
                </div>
              </div>
            ) : null}

            {showSuggestions ? (
              <div className={styles.suggestions}>
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion.id}
                    type="button"
                    className={styles.suggestionBtn}
                    onClick={() => void sendQuestion(suggestion.label, suggestion.id)}
                  >
                    {suggestion.label}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <form className={styles.form} onSubmit={onSubmit}>
            <div className={styles.inputWrap}>
              <textarea
                ref={inputRef}
                className={styles.input}
                rows={1}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={onKeyDown}
                placeholder={copy.placeholder}
                disabled={loading}
              />
              <button
                type="submit"
                className={styles.sendBtn}
                disabled={loading || !input.trim()}
                aria-label={copy.send}
              >
                <SendHorizontal size={18} strokeWidth={2} />
              </button>
            </div>
          </form>
        </section>
      ) : null}

      <button
        type="button"
        className={`${styles.fab} ${isOpen ? styles.fabOpen : ""}`}
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-label={isOpen ? copy.close : copy.open}
      >
        {isOpen ? (
          <X size={24} strokeWidth={2} />
        ) : (
          <MessageCircleQuestionMark size={26} strokeWidth={2} />
        )}
      </button>
    </div>,
    document.body,
  );
}
