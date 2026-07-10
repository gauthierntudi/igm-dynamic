/**
 * Ajoute « Revue de presse » au menu Multimédia principal (grand écran).
 * Usage: npx tsx --env-file=.env.local scripts/sync-press-review-nav.ts
 */
import { getPayload } from "payload";

import { hrefForRoute } from "../src/i18n/paths";
import { CUSTOM_NAV_LINK_VALUE } from "../src/lib/siteNavLinks";
import configPromise from "../src/payload.config";

const PRESS_LABEL = {
  fr: "Revue de presse",
  en: "Press review",
} as const;

const MEDIA_LIBRARY_LABELS = new Set(["Multimédia", "Médiathèque"]);

function hasPressReviewLink(
  items: Array<{ label?: string | null; navLink?: string | null; customHref?: string | null }> | null | undefined,
): boolean {
  return (
    items?.some((item) => {
      const label = item.label?.trim().toLowerCase();
      const href = item.customHref?.trim() || item.navLink?.trim();
      return (
        label === "revue de presse" ||
        label === "press review" ||
        href === "/revue-de-presse" ||
        href === "/press-review"
      );
    }) ?? false
  );
}

function createPressReviewLink(locale: "fr" | "en") {
  return {
    itemType: "link" as const,
    label: PRESS_LABEL[locale],
    navLink: CUSTOM_NAV_LINK_VALUE,
    customHref: hrefForRoute("pressReview", locale),
    cssClass: null,
    nestedIcon: "plus" as const,
    subItems: [],
  };
}

function patchMediaLibraryChildren(
  headerNav: Array<Record<string, unknown>>,
  locale: "fr" | "en",
): boolean {
  let changed = false;

  for (const item of headerNav) {
    if (item.itemType === "dropdown" && MEDIA_LIBRARY_LABELS.has(String(item.label ?? ""))) {
      const children = (item.children as Array<Record<string, unknown>> | undefined) ?? [];
      if (!hasPressReviewLink(children)) {
        item.children = [...children, createPressReviewLink(locale)];
        changed = true;
      }
    }

    const children = item.children as Array<Record<string, unknown>> | undefined;
    if (!children?.length) continue;

    for (const child of children) {
      if (child.itemType === "dropdown" && MEDIA_LIBRARY_LABELS.has(String(child.label ?? ""))) {
        const subItems = (child.subItems as Array<Record<string, unknown>> | undefined) ?? [];
        if (!hasPressReviewLink(subItems)) {
          child.subItems = [...subItems, createPressReviewLink(locale)];
          changed = true;
          continue;
        }

        for (const subItem of subItems) {
          if (
            subItem.navLink === CUSTOM_NAV_LINK_VALUE &&
            subItem.customHref === "/press-review" &&
            locale === "fr"
          ) {
            subItem.customHref = hrefForRoute("pressReview", "fr");
            changed = true;
          }
        }
      }
    }
  }

  return changed;
}

async function main() {
  const payload = await getPayload({ config: configPromise });
  const settings = await payload.findGlobal({ slug: "site-settings", depth: 3, locale: "fr" });

  const headerNav = structuredClone(settings.headerNav ?? []) as Array<Record<string, unknown>>;
  const changedFr = patchMediaLibraryChildren(headerNav, "fr");
  const changedEn = patchMediaLibraryChildren(headerNav, "en");

  if (!changedFr && !changedEn) {
    console.log("Menu déjà à jour — aucune modification.");
    await payload.db.destroy?.();
    return;
  }

  await payload.updateGlobal({
    slug: "site-settings",
    locale: "all",
    data: { headerNav },
  });

  console.log("✓ « Revue de presse » ajoutée au menu Multimédia (grand écran + menu condensé).");
  await payload.db.destroy?.();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
