import { headers } from "next/headers";

import { normalizeBasePath } from "@/lib/i18n/middlewareLocale";
import { isSiteHomePathname } from "@/lib/routing/pathUtils";

import { ENABLE_SITE_LOADER } from "./siteAssets";

export async function shouldShowSiteLoader(): Promise<boolean> {
  if (!ENABLE_SITE_LOADER) return false;

  const pathname = (await headers()).get("x-pathname");
  if (!pathname) return false;

  return isSiteHomePathname(pathname, normalizeBasePath(process.env.BASE_PATH));
}
