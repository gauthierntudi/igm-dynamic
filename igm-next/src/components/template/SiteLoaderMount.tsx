"use client";

import { useEffect, useState } from "react";

import type { SupportedLocale } from "@/i18n/locales";
import { withDeployedBase } from "@/lib/deployBasePath";
import { SITE_SCRIPT_FILES } from "@/lib/template/siteAssets";

import { SiteLoader } from "./SiteLoader";

type Props = {
  locale: SupportedLocale;
};

/**
 * Le loader anime du texte via igm-loader.js — incompatible avec l’hydratation
 * React si rendu côté serveur. Montage strictement client après hydratation.
 */
export function SiteLoaderMount({ locale }: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const existing = document.getElementById("igm-loader-script");
    if (existing) return;

    const script = document.createElement("script");
    script.id = "igm-loader-script";
    script.src = withDeployedBase(SITE_SCRIPT_FILES.loader);
    script.async = true;
    document.body.appendChild(script);
  }, [mounted]);

  if (!mounted) return null;

  return <SiteLoader locale={locale} />;
}
