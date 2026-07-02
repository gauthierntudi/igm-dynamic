"use client";

import { useEffect } from "react";

import { withDeployedBase } from "@/lib/deployBasePath";
import { SITE_SCRIPT_FILES } from "@/lib/template/siteAssets";

/** Charge igm-loader.js après hydratation React (évite l’erreur #418). */
export function SiteLoaderScript() {
  useEffect(() => {
    if (document.getElementById("igm-loader-script")) return;

    const script = document.createElement("script");
    script.id = "igm-loader-script";
    script.src = withDeployedBase(SITE_SCRIPT_FILES.loader);
    script.async = true;
    document.body.appendChild(script);
  }, []);

  return null;
}
