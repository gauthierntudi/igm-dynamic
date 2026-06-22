"use client";

import { DenoncerOpenTrigger } from "@/components/signalement/DenoncerOpenTrigger";
import { hrefForRoute } from "@/i18n/paths";
import type { SupportedLocale } from "@/i18n/locales";

import { PrimaryBtn4Content } from "./PrimaryBtn4Content";

type Props = {
  label: string;
  href: string;
  variant: "black-bg" | "transparent";
  locale: SupportedLocale;
};

function isReportHref(href: string, locale: SupportedLocale): boolean {
  const reportHref = hrefForRoute("report", locale);
  return href === reportHref || href.includes("/denoncer") || href.includes("/report");
}

export function HomeBannerCta({ label, href, variant, locale }: Props) {
  const className = `primary-btn4 ${variant}`;

  if (isReportHref(href, locale)) {
    return (
      <DenoncerOpenTrigger variant="primary" className={className}>
        <PrimaryBtn4Content label={label} />
      </DenoncerOpenTrigger>
    );
  }

  return (
    <a href={href} className={className}>
      <PrimaryBtn4Content label={label} />
    </a>
  );
}
