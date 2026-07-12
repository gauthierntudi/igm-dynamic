/**
 * Réordonne le sous-menu « Qui sommes-nous ? » : À propos → Mission → Historique.
 * Redirige aussi « Historique » vers la section #igm-wwa-history sur /a-propos.
 * Usage: npx tsx --env-file=.env.local scripts/sync-who-we-are-nav-order.ts
 */
import { getPayload } from "payload";

import { hrefForRoute, WHO_WE_ARE_HISTORY_SECTION_ID } from "../src/i18n/paths";
import { CUSTOM_NAV_LINK_VALUE } from "../src/lib/siteNavLinks";
import configPromise from "../src/payload.config";

const WHO_WE_ARE_LABELS = new Set(["Qui sommes-nous ?", "Who we are"]);
const HISTORY_LABELS = new Set(["Historique", "History"]);
const ABOUT_HISTORY_CUSTOM_HREF = `/a-propos#${WHO_WE_ARE_HISTORY_SECTION_ID}`;

type NavRow = Record<string, unknown>;

function itemHref(item: NavRow): string {
  const custom = typeof item.customHref === "string" ? item.customHref.trim() : "";
  const navLink = typeof item.navLink === "string" ? item.navLink.trim() : "";
  return custom || navLink;
}

function isHistoryMenuItem(item: NavRow): boolean {
  const label = String(item.label ?? "").trim();
  return HISTORY_LABELS.has(label);
}

function patchHistoryNavLink(item: NavRow): boolean {
  if (item.itemType !== "link" || !isHistoryMenuItem(item)) return false;

  const href = itemHref(item);
  const pathOnly = href.split("#")[0]?.replace(/\/$/, "") || "";
  const historyPaths = new Set([
    "/historique",
    "/history",
    hrefForRoute("history", "fr").replace(/\/$/, ""),
    hrefForRoute("history", "en").replace(/\/$/, ""),
  ]);

  if (!historyPaths.has(pathOnly) && href !== ABOUT_HISTORY_CUSTOM_HREF) {
    return false;
  }

  if (item.navLink === CUSTOM_NAV_LINK_VALUE && item.customHref === ABOUT_HISTORY_CUSTOM_HREF) {
    return false;
  }

  item.navLink = CUSTOM_NAV_LINK_VALUE;
  item.customHref = ABOUT_HISTORY_CUSTOM_HREF;
  return true;
}

function whoWeAreSortRank(href: string): number {
  const normalized = href.replace(/\/$/, "").split("#")[0] || "/";
  const about = hrefForRoute("about", "fr").replace(/\/$/, "");
  const mission = hrefForRoute("mission", "fr").replace(/\/$/, "");
  const history = hrefForRoute("history", "fr").replace(/\/$/, "");
  const aboutEn = hrefForRoute("about", "en").replace(/\/$/, "");
  const missionEn = hrefForRoute("mission", "en").replace(/\/$/, "");
  const historyEn = hrefForRoute("history", "en").replace(/\/$/, "");

  if (normalized === about || normalized === aboutEn) return 0;
  if (normalized === mission || normalized === missionEn) return 1;
  if (
    normalized === history ||
    normalized === historyEn ||
    href === ABOUT_HISTORY_CUSTOM_HREF ||
    href === `${aboutEn}#${WHO_WE_ARE_HISTORY_SECTION_ID}` ||
    href.endsWith(`#${WHO_WE_ARE_HISTORY_SECTION_ID}`)
  ) {
    return 2;
  }
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

  let changed = false;
  for (const item of subItems) {
    if (patchHistoryNavLink(item)) changed = true;
  }

  const sorted = sortWhoWeAreSubItems(subItems);
  if (subItemsSignature(sorted) !== subItemsSignature(subItems)) {
    dropdown.subItems = sorted;
    changed = true;
  }

  return changed;
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

  console.log(
    "✓ Sous-menu « Qui sommes-nous ? » mis à jour : ordre + lien Historique → section /a-propos.",
  );
  await payload.db.destroy?.();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
