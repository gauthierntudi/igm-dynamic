"use client";

import { useEffect } from "react";

import { useLocale } from "@/components/i18n/LocaleProvider";

/** Met à jour `<html lang="…">` selon la locale courante. */
export function DocumentLang() {
  const { locale } = useLocale();

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return null;
}
