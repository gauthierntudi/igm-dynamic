"use client";

import { useEffect, useState } from "react";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { withDeployedBase } from "@/lib/deployBasePath";
import { LOCALE_COOKIE_MAX_AGE, LOCALE_COOKIE_NAME, localeCookiePath } from "@/lib/i18n/localeCookie";
import { SUPPORTED_LOCALES, type SupportedLocale } from "@/i18n/locales";
import { switchLocaleHref } from "@/i18n/paths";

const SHORT_LABELS: Record<SupportedLocale, string> = {
  fr: "FR",
  en: "EN",
};

function setLocaleCookie(locale: SupportedLocale) {
  const basePath = localeCookiePath(
    typeof process.env.NEXT_PUBLIC_BASE_PATH === "string"
      ? process.env.NEXT_PUBLIC_BASE_PATH
      : "",
  );
  document.cookie = `${LOCALE_COOKIE_NAME}=${locale}; path=${basePath}; max-age=${LOCALE_COOKIE_MAX_AGE}; samesite=lax`;
}

function defaultHrefByLocale(pathname: string): Record<SupportedLocale, string> {
  return Object.fromEntries(
    SUPPORTED_LOCALES.map((code) => [code, switchLocaleHref(pathname, code)]),
  ) as Record<SupportedLocale, string>;
}

export function LanguageSwitcher({ className }: { className?: string }) {
  const { locale, pathname } = useLocale();
  const [hrefByLocale, setHrefByLocale] = useState<Record<SupportedLocale, string>>(() =>
    defaultHrefByLocale(pathname),
  );

  useEffect(() => {
    setHrefByLocale(defaultHrefByLocale(pathname));

    const controller = new AbortController();
    const url = withDeployedBase(
      `/api/i18n/alternate-paths?pathname=${encodeURIComponent(pathname)}`,
    );

    fetch(url, { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { hrefs?: Record<SupportedLocale, string> } | null) => {
        if (data?.hrefs) {
          setHrefByLocale(data.hrefs);
        }
      })
      .catch(() => {
        /* fallback: switchLocaleHref already applied */
      });

    return () => controller.abort();
  }, [pathname]);

  return (
    <nav
      className={["igm-lang-switch", className].filter(Boolean).join(" ")}
      aria-label="Language"
    >
      {SUPPORTED_LOCALES.map((code, index) => (
        <span key={code} className="igm-lang-switch-item">
          {index > 0 ? <span className="igm-lang-switch-sep" aria-hidden="true">|</span> : null}
          {code === locale ? (
            <span className="igm-lang-switch-link is-active" aria-current="true">
              {SHORT_LABELS[code]}
            </span>
          ) : (
            <a
              href={withDeployedBase(hrefByLocale[code])}
              className="igm-lang-switch-link"
              hrefLang={code}
              lang={code}
              onClick={() => setLocaleCookie(code)}
            >
              {SHORT_LABELS[code]}
            </a>
          )}
        </span>
      ))}
    </nav>
  );
}
