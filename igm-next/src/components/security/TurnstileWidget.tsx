"use client";

import Script from "next/script";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";

type TurnstileApi = {
  render: (
    container: HTMLElement,
    options: {
      sitekey: string;
      callback: (token: string) => void;
      "expired-callback"?: () => void;
      "error-callback"?: () => void;
      theme?: "light" | "dark" | "auto";
    },
  ) => string;
  reset: (widgetId: string) => void;
  remove: (widgetId: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

export type TurnstileWidgetHandle = {
  reset: () => void;
};

type Props = {
  siteKey: string;
  onToken: (token: string) => void;
  onExpire?: () => void;
  onError?: () => void;
  theme?: "light" | "dark" | "auto";
};

export const TurnstileWidget = forwardRef<TurnstileWidgetHandle, Props>(
  function TurnstileWidget({ siteKey, onToken, onExpire, onError, theme = "auto" }, ref) {
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetIdRef = useRef<string | null>(null);
    const scriptReadyRef = useRef(false);

    const removeWidget = useCallback(() => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    }, []);

    const renderWidget = useCallback(() => {
      if (!scriptReadyRef.current || !containerRef.current || !window.turnstile) {
        return;
      }
      removeWidget();
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        callback: onToken,
        "expired-callback": onExpire,
        "error-callback": onError,
        theme,
      });
    }, [siteKey, onToken, onExpire, onError, theme, removeWidget]);

    useImperativeHandle(
      ref,
      () => ({
        reset() {
          if (widgetIdRef.current && window.turnstile) {
            window.turnstile.reset(widgetIdRef.current);
          } else {
            renderWidget();
          }
        },
      }),
      [renderWidget],
    );

    useEffect(() => {
      renderWidget();
      return removeWidget;
    }, [renderWidget, removeWidget]);

    return (
      <>
        <Script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js"
          strategy="lazyOnload"
          onLoad={() => {
            scriptReadyRef.current = true;
            renderWidget();
          }}
        />
        <div ref={containerRef} aria-label="Contrôle de sécurité Cloudflare Turnstile" />
      </>
    );
  },
);
