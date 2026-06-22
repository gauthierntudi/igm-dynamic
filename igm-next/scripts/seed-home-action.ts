/**
 * Remplit la section Action terrain de la page d'accueil si elle est vide.
 * Usage: npm run seed:home-action
 *        npm run seed:home-action:force
 */
import {
  DEFAULT_HOME_ACTION_EN,
  DEFAULT_HOME_ACTION_FR,
} from "../src/lib/cms/defaultHomeActionSeed";
import { getPayloadClient } from "../src/lib/cms/payload";

const force = process.argv.includes("--force");

function isActionEmpty(action: Record<string, unknown> | null | undefined): boolean {
  if (!action) return true;
  return !action.titlePrefix && !action.titleHighlight && !action.lead && !action.ctaLabel;
}

async function seedLocale(
  payload: Awaited<ReturnType<typeof getPayloadClient>>,
  locale: "fr" | "en",
  data: typeof DEFAULT_HOME_ACTION_FR,
) {
  const home = await payload.findGlobal({ slug: "home", locale, depth: 0 });
  const current = (home as { actionSection?: Record<string, unknown> }).actionSection;

  if (!force && !isActionEmpty(current)) {
    console.log(`[${locale}] Action terrain déjà renseignée — ignoré (utilisez --force)`);
    return;
  }

  await payload.updateGlobal({
    slug: "home",
    locale,
    data: { actionSection: data },
    depth: 0,
  });

  console.log(`[${locale}] Action terrain initialisée.`);
}

const payload = await getPayloadClient();
await seedLocale(payload, "fr", DEFAULT_HOME_ACTION_FR);
await seedLocale(payload, "en", DEFAULT_HOME_ACTION_EN);
process.exit(0);
