import { revalidatePath, revalidateTag } from "next/cache";
import type { CollectionAfterChangeHook, GlobalAfterChangeHook } from "payload";

import { localePathPrefix, SUPPORTED_LOCALES } from "@/i18n/locales";

function revalidateSite(tags: string[]) {
  try {
    for (const tag of tags) {
      revalidateTag(tag, "max");
    }
    revalidatePath("/");
    for (const locale of SUPPORTED_LOCALES) {
      revalidatePath(localePathPrefix(locale) || "/");
    }
  } catch {
    // Hors contexte Next.js (scripts CLI, migrations).
  }
}

function revalidatePagePaths(slug: string) {
  try {
    revalidatePath(`/${slug}`);
    if (slug === "home") {
      revalidatePath("/");
    }

    for (const locale of SUPPORTED_LOCALES) {
      const prefix = localePathPrefix(locale);
      const localizedPath = prefix ? `${prefix}/${slug}` : `/${slug}`;
      revalidatePath(localizedPath);
      if (slug === "home" && prefix) {
        revalidatePath(prefix);
      }
    }
  } catch {
    // Hors contexte Next.js (scripts CLI, migrations).
  }
}

export const revalidateFrontCollection: CollectionAfterChangeHook = ({ collection, doc }) => {
  const tags = [`collection:${collection.slug}`, `doc:${collection.slug}:${doc.id}`];

  for (const locale of SUPPORTED_LOCALES) {
    tags.push(`collection:${collection.slug}:${locale}`);
  }

  if (collection.slug === "pages" && typeof doc.slug === "string" && doc.slug.length > 0) {
    tags.push(`page:slug:${doc.slug}`);
    for (const locale of SUPPORTED_LOCALES) {
      tags.push(`page:slug:${doc.slug}:${locale}`);
    }
    revalidatePagePaths(doc.slug);
  }

  revalidateSite(tags);
  return doc;
};

export const revalidateFrontGlobal: GlobalAfterChangeHook = ({ global, doc }) => {
  const tags = [`global:${global.slug}`];
  for (const locale of SUPPORTED_LOCALES) {
    tags.push(`global:${global.slug}:${locale}`);
  }

  if (global.slug === "who-we-are") {
    try {
      revalidatePath("/a-propos");
      revalidatePath("/historique");
      revalidatePath("/mission");
      revalidatePath("/en/about");
      revalidatePath("/en/history");
      revalidatePath("/en/mission");
    } catch {
      // Hors contexte Next.js.
    }
  }

  revalidateSite(tags);
  return doc;
};
