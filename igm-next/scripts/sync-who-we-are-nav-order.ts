/**
 * Réordonne le sous-menu « Qui sommes-nous ? » : À propos → Mission → Historique.
 * Usage: npx tsx --env-file=.env.local scripts/sync-who-we-are-nav-order.ts
 */
import { getPayload } from "payload";

import { hrefForRoute } from "../src/i18n/paths";
import configPromise from "../src/payload.config";

const WHO_WE_ARE_LABELS = new Set(["Qui sommes-nous ?", "Who we are"]);

type NavRow = Record<string, unknown>;

function itemHref(item: NavRow): string {
  const custom = typeof item.customHref === "string" ? item.customHref.trim() : "";
  const navLink = typeof item.navLink === "string" ? item.navLink.trim() : "";
  return custom || navLink;
}

function whoWeAreSortRank(href: string): number {
  const normalized = href.replace(/\/$/, "") || "/";
  const about = hrefForRoute("about", "fr").replace(/\/$/, "");
  const mission = hrefForRoute("mission", "fr").replace(/\/$/, "");
  const history = hrefForRoute("history", "fr").replace(/\/$/, "");
  const aboutEn = hrefForRoute("about", "en").replace(/\/$/, "");
  const missionEn = hrefForRoute("mission", "en").replace(/\/$/, "");
  const historyEn = hrefForRoute("history", "en").replace(/\/$/, "");

  if (normalized === about || normalized === aboutEn) return 0;
  if (normalized === mission || normalized === missionEn) return 1;
  if (normalized === history || normalized === historyEn) return 2;
  return 99;
}

function sortWhoWeAreSubItems(subItems: NavRow[]): NavRow[] {
  return [...subItems].sort((a, b) => whoWeAreSortRank(itemHref(a)) - whoWeAreSortRank(itemHref(b)));
}

function subItemsSignature(subItems: NavRow[]): string {
  return subItems.map((item) => itemHref(item)).join("|");
}

function patchWhoWeAreDropdown(dropdown: NavRow): boolean {
  const subItems = (dropdown.subItems as NavRow[] | undefined) ?? [];
  if (subItems.length < 2) return false;

  const sorted = sortWhoWeAreSubItems(subItems);
  if (subItemsSignature(sorted) === subItemsSignature(subItems)) {
    return false;
  }

  dropdown.subItems = sorted;
  return true;
}

function patchHeaderNav(headerNav: NavRow[]): boolean {
  let changed = false;

  for (const item of headerNav) {
    const children = (item.children as NavRow[] | undefined) ?? [];
    for (const child of children) {
      if (child.itemType !== "dropdown") continue;
      if (!WHO_WE_ARE_LABELS.has(String(child.label ?? ""))) continue;
      if (patchWhoWeAreDropdown(child)) changed = true;
    }
  }

  return changed;
}

async function main() {
  const payload = await getPayload({ config: configPromise });
  const settings = await payload.findGlobal({ slug: "site-settings", depth: 3, locale: "fr" });

  const headerNav = structuredClone(settings.headerNav ?? []) as NavRow[];
  if (!patchHeaderNav(headerNav)) {
    console.log("Menu déjà à jour — aucune modification.");
    await payload.db.destroy?.();
    return;
  }

  await payload.updateGlobal({
    slug: "site-settings",
    locale: "all",
    data: { headerNav },
  });

  console.log("✓ Sous-menu « Qui sommes-nous ? » réordonné : À propos → Mission → Historique.");
  await payload.db.destroy?.();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
