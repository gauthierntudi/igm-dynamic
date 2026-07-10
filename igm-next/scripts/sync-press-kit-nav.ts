/**
 * Ajoute « Dossier de presse » dans Présentation, après Organigramme.
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

const PRESENTATION_LABELS = new Set(["Présentation", "Presentation"]);
const ORG_CHART_LABELS = new Set(["Organigramme", "Org chart"]);

function hasPressKitLink(
  items: Array<{ label?: string | null; navLink?: string | null; customHref?: string | null }> | null | undefined,
): boolean {
  return (
    items?.some((item) => {
      const label = item.label?.trim().toLowerCase();
      const href = item.customHref?.trim() || item.navLink?.trim();
      return (
        label === "dossier de presse" ||
        label === "press kit" ||
        href === "/dossier-de-presse" ||
        href === "/press-kit"
      );
    }) ?? false
  );
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

function insertAfterOrgChart(items: Array<Record<string, unknown>>): boolean {
  if (hasPressKitLink(items)) return false;

  const orgIndex = items.findIndex((item) =>
    ORG_CHART_LABELS.has(String(item.label ?? "")),
  );
  if (orgIndex === -1) return false;

  items.splice(orgIndex + 1, 0, createPressKitLink());
  return true;
}

function patchPresentationMenu(headerNav: Array<Record<string, unknown>>): boolean {
  for (const item of headerNav) {
    if (item.itemType !== "dropdown" || !PRESENTATION_LABELS.has(String(item.label ?? ""))) {
      continue;
    }

    const children = (item.children as Array<Record<string, unknown>> | undefined) ?? [];
    if (insertAfterOrgChart(children)) {
      item.children = children;
      return true;
    }
  }

  return false;
}

async function main() {
  const payload = await getPayload({ config: configPromise });
  const settings = await payload.findGlobal({ slug: "site-settings", depth: 3, locale: "fr" });

  const headerNav = structuredClone(settings.headerNav ?? []) as Array<Record<string, unknown>>;
  const changed = patchPresentationMenu(headerNav);

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

  console.log("✓ « Dossier de presse » ajouté au menu Présentation (après Organigramme).");
  await payload.db.destroy?.();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
