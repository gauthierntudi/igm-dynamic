"use client";

import { usePathname } from "next/navigation";
import { createContext, useContext, useMemo, type ReactNode } from "react";

import { getMessages, type Messages } from "@/i18n/messages";
import { parseLocaleFromSegments, type SupportedLocale } from "@/i18n/locales";

type LocaleContextValue = {
  locale: SupportedLocale;
  messages: Messages;
  pathname: string;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname() || "/";

  const value = useMemo(() => {
    const segments = pathname.split("/").filter(Boolean);
    const { locale } = parseLocaleFromSegments(segments);
    return {
      locale,
      messages: getMessages(locale),
      pathname,
    };
  }, [pathname]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error("useLocale must be used within LocaleProvider");
  }
  return ctx;
}
