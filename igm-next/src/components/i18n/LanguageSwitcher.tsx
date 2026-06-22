"use client";

import { useLocale } from "@/components/i18n/LocaleProvider";
import { withDeployedBase } from "@/lib/deployBasePath";
import { SUPPORTED_LOCALES, type SupportedLocale } from "@/i18n/locales";
import { switchLocaleHref } from "@/i18n/paths";

const SHORT_LABELS: Record<SupportedLocale, string> = {
  fr: "FR",
  en: "EN",
};

export function LanguageSwitcher({ className }: { className?: string }) {
  const { locale, pathname } = useLocale();

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
              href={withDeployedBase(switchLocaleHref(pathname, code))}
              className="igm-lang-switch-link"
              hrefLang={code}
              lang={code}
            >
              {SHORT_LABELS[code]}
            </a>
          )}
        </span>
      ))}
    </nav>
  );
}
