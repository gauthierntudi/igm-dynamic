/**
 * Importe le menu header + footer du template dans site-settings (Payload).
 * Usage: npx tsx --env-file=.env.local scripts/seed-site-settings.ts
 * Options: --force pour écraser un menu déjà présent
 */
import { getPayload } from "payload";

import { buildDefaultSiteSettingsSeed } from "../src/lib/cms/defaultSiteSettingsSeed";
import configPromise from "../src/payload.config";

const force = process.argv.includes("--force");

async function main() {
  if (!process.env.DATABASE_URI?.trim() && !process.env.DATABASE_URL?.trim()) {
    console.error("DATABASE_URI manquant.");
    process.exit(1);
  }

  const payload = await getPayload({ config: configPromise });
  const existing = await payload.findGlobal({ slug: "site-settings", depth: 0, locale: "fr" });

  if (existing.headerNav?.length && !force) {
    console.log(
      "Le menu header contient déjà des éléments. Relancez avec --force pour remplacer.",
    );
    process.exit(0);
  }

  const seed = buildDefaultSiteSettingsSeed();

  await payload.updateGlobal({
    slug: "site-settings",
    locale: "all",
    data: seed,
  });

  console.log(`✓ site-settings mis à jour (${seed.headerNav.length} entrées menu header).`);
  await payload.db.destroy?.();
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
