/**
 * Déplace « Dossier de presse » vers Multimédia (retire de Présentation si présent).
 * Usage: npx tsx --env-file=.env.local scripts/sync-press-kit-nav.ts
 */
import { getPayload } from "payload";

import { hrefForRoute } from "../src/i18n/paths";
import { CUSTOM_NAV_LINK_VALUE } from "../src/lib/siteNavLinks";
import configPromise from "../src/payload.config";

const PRESS_KIT_LABEL = {
  fr: "Dossier de presse",
  en: "Press kit",
} as const;

const PRESENTATION_LABELS = new Set(["Présentation", "Presentation", "About us"]);
const MEDIA_LIBRARY_LABELS = new Set(["Multimédia", "Médiathèque", "Media library", "Multimedia"]);

function isPressKitItem(item: Record<string, unknown>): boolean {
  const label = String(item.label ?? "").trim().toLowerCase();
  const href = String(item.customHref ?? item.navLink ?? "").trim();
  return (
    label === "dossier de presse" ||
    label === "press kit" ||
    href === "/dossier-de-presse" ||
    href === "/press-kit" ||
    href.endsWith("/dossier-de-presse") ||
    href.endsWith("/press-kit")
  );
}

function hasPressKitLink(
  items: Array<Record<string, unknown>> | null | undefined,
): boolean {
  return items?.some((item) => isPressKitItem(item)) ?? false;
}

function createPressKitLink() {
  return {
    itemType: "link" as const,
    label: PRESS_KIT_LABEL.fr,
    navLink: CUSTOM_NAV_LINK_VALUE,
    customHref: hrefForRoute("pressKit", "fr"),
    cssClass: null,
    nestedIcon: "plus" as const,
    subItems: [],
  };
}

function removePressKitFromItems(items: Array<Record<string, unknown>>): boolean {
  const before = items.length;
  const filtered = items.filter((item) => !isPressKitItem(item));
  if (filtered.length === before) return false;
  items.splice(0, items.length, ...filtered);
  return true;
}

function insertPressKitInMedia(items: Array<Record<string, unknown>>): boolean {
  if (hasPressKitLink(items)) return false;

  const pressReviewIndex = items.findIndex((item) => {
    const label = String(item.label ?? "").trim().toLowerCase();
    const href = String(item.customHref ?? item.navLink ?? "").trim();
    return (
      label === "revue de presse" ||
      label === "press review" ||
      href.includes("revue-de-presse") ||
      href.includes("press-review")
    );
  });

  const link = createPressKitLink();
  if (pressReviewIndex === -1) {
    items.push(link);
  } else {
    items.splice(pressReviewIndex, 0, link);
  }
  return true;
}

function patchHeaderNav(headerNav: Array<Record<string, unknown>>): boolean {
  let changed = false;

  for (const item of headerNav) {
    if (item.itemType === "dropdown" && PRESENTATION_LABELS.has(String(item.label ?? ""))) {
      const children = (item.children as Array<Record<string, unknown>> | undefined) ?? [];
      if (removePressKitFromItems(children)) {
        item.children = children;
        changed = true;
      }
    }

    if (item.itemType === "dropdown" && MEDIA_LIBRARY_LABELS.has(String(item.label ?? ""))) {
      const children = (item.children as Array<Record<string, unknown>> | undefined) ?? [];
      if (insertPressKitInMedia(children)) {
        item.children = children;
        changed = true;
      }
    }

    const children = item.children as Array<Record<string, unknown>> | undefined;
    if (!children?.length) continue;

    for (const child of children) {
      if (child.itemType === "dropdown" && PRESENTATION_LABELS.has(String(child.label ?? ""))) {
        const subItems = (child.subItems as Array<Record<string, unknown>> | undefined) ?? [];
        if (removePressKitFromItems(subItems)) {
          child.subItems = subItems;
          changed = true;
        }
      }

      if (child.itemType === "dropdown" && MEDIA_LIBRARY_LABELS.has(String(child.label ?? ""))) {
        const subItems = (child.subItems as Array<Record<string, unknown>> | undefined) ?? [];
        if (insertPressKitInMedia(subItems)) {
          child.subItems = subItems;
          changed = true;
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
  const changed = patchHeaderNav(headerNav);

  if (!changed) {
    console.log("Menu déjà à jour — aucune modification.");
    await payload.db.destroy?.();
    return;
  }

  await payload.updateGlobal({
    slug: "site-settings",
    locale: "all",
    data: { headerNav },
  });

  console.log("✓ « Dossier de presse » déplacé vers Multimédia (retiré de Présentation).");
  await payload.db.destroy?.();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
