/**
 * Remplit le global « Page À propos » si vide.
 * Usage: npm run seed:who-we-are
 *        npm run seed:who-we-are:force
 */
import {
  DEFAULT_WHO_WE_ARE_EN,
  DEFAULT_WHO_WE_ARE_FR,
} from "../src/lib/cms/defaultWhoWeAreSeed";
import { getPayloadClient } from "../src/lib/cms/payload";

const force = process.argv.includes("--force");

function isEmpty(data: Record<string, unknown> | null | undefined): boolean {
  if (!data) return true;
  return !data.headline && !data.aboutSection;
}

async function seedLocale(
  payload: Awaited<ReturnType<typeof getPayloadClient>>,
  locale: "fr" | "en",
  data: typeof DEFAULT_WHO_WE_ARE_FR,
) {
  const current = await payload.findGlobal({ slug: "who-we-are", locale, depth: 0 });

  if (!force && !isEmpty(current as Record<string, unknown>)) {
    console.log(`[${locale}] Page À propos déjà renseignée — ignoré (utilisez --force)`);
    return;
  }

  await payload.updateGlobal({
    slug: "who-we-are",
    locale,
    data,
    depth: 0,
  });

  console.log(`[${locale}] Page À propos initialisée.`);
}

const payload = await getPayloadClient();
await seedLocale(payload, "fr", DEFAULT_WHO_WE_ARE_FR);
await seedLocale(payload, "en", DEFAULT_WHO_WE_ARE_EN);
process.exit(0);
