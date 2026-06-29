import type { Metadata } from "next";

import { localePathPrefix, type SupportedLocale } from "@/i18n/locales";
import { deployedBasePath } from "@/lib/deployBasePath";

import { absoluteOgImageUrl, absoluteSiteUrl, getSiteOrigin } from "./siteOrigin";

const DEFAULT_OG_IMAGE = "/assets/img/banner-img.jpg";
const SITE_NAME = "IGM";

const OG_LOCALE: Record<SupportedLocale, string> = {
  fr: "fr_FR",
  en: "en_US",
};

export type SiteMetadataInput = {
  title: string;
  description?: string | null;
  pathname: string;
  locale: SupportedLocale;
  type?: "website" | "article";
  image?: string | null;
  imageAlt?: string | null;
  publishedTime?: string | null;
  siteName?: string;
};

export function buildPathname(locale: SupportedLocale, pathSegments: string[]): string {
  const prefix = localePathPrefix(locale);
  if (pathSegments.length === 0) return prefix || "/";

  const slugPath = pathSegments.join("/");
  return prefix ? `${prefix}/${slugPath}` : `/${slugPath}`;
}

export function buildSiteMetadata(input: SiteMetadataInput): Metadata {
  const {
    title,
    description,
    pathname,
    locale,
    type = "website",
    image,
    imageAlt,
    publishedTime,
    siteName = SITE_NAME,
  } = input;

  const canonicalPath = deployedBasePath()
    ? `${deployedBasePath()}${pathname.startsWith("/") ? pathname : `/${pathname}`}`.replace("//", "/")
    : pathname;

  const url = absoluteSiteUrl(canonicalPath);
  const ogImage = absoluteOgImageUrl(image) ?? absoluteOgImageUrl(DEFAULT_OG_IMAGE)!;
  const desc = description?.trim() || undefined;

  const openGraph: Metadata["openGraph"] = {
    type,
    url,
    title,
    description: desc,
    siteName,
    locale: OG_LOCALE[locale],
    images: [
      {
        url: ogImage,
        alt: imageAlt?.trim() || title,
      },
    ],
    ...(type === "article" && publishedTime
      ? { publishedTime: new Date(publishedTime).toISOString() }
      : {}),
  };

  return {
    title,
    description: desc,
    metadataBase: new URL(getSiteOrigin()),
    alternates: {
      canonical: url,
    },
    openGraph,
    twitter: {
      card: "summary_large_image",
      title,
      description: desc,
      images: [ogImage],
    },
  };
}
