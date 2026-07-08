/**
 * Initialise les 22 provinces déployées dans le global cartography-settings.
 * Conserve les inspecteurs déjà saisis. N'écrase aucune autre donnée.
 *
 * Usage: npm run seed:cartography-provinces
 */
import { mergeDeployedProvinceAssignments } from "../src/lib/cartography/provinceAssignments";
import type { CmsCartographySettings } from "../src/lib/cms/cartography/types";
import { getPayloadClient } from "../src/lib/cms/payload";

async function main() {
  if (!process.env.DATABASE_URI?.trim() && !process.env.DATABASE_URL?.trim()) {
    console.error("DATABASE_URI manquant.");
    process.exit(1);
  }

  const payload = await getPayloadClient();
  const current = (await payload.findGlobal({
    slug: "cartography-settings" as never,
    depth: 0,
  })) as CmsCartographySettings;

  const merged = mergeDeployedProvinceAssignments(current.provinceAssignments);
  const beforeCount = current.provinceAssignments?.length ?? 0;

  await payload.updateGlobal({
    slug: "cartography-settings" as never,
    data: {
      provinceAssignments: merged,
    },
    depth: 0,
  });

  console.log(
    `Cartographie : ${merged.length} provinces déployées prêtes (${beforeCount} → ${merged.length} lignes).`,
  );
  console.log("Les inspecteurs existants ont été conservés.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
