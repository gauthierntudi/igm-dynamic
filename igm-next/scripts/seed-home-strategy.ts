/**
 * Remplit la section Stratégie de la page d'accueil si elle est vide.
 * Usage: npm run seed:home-strategy
 *        npm run seed:home-strategy:force
 */
import {
  DEFAULT_HOME_STRATEGY_EN,
  DEFAULT_HOME_STRATEGY_FR,
} from "../src/lib/cms/defaultHomeStrategySeed";
import { getPayloadClient } from "../src/lib/cms/payload";

const force = process.argv.includes("--force");

function isStrategyEmpty(strategy: Record<string, unknown> | null | undefined): boolean {
  if (!strategy) return true;
  return !strategy.title && !strategy.lead && !strategy.ctaLabel;
}

async function seedLocale(
  payload: Awaited<ReturnType<typeof getPayloadClient>>,
  locale: "fr" | "en",
  data: typeof DEFAULT_HOME_STRATEGY_FR,
) {
  const home = await payload.findGlobal({ slug: "home", locale, depth: 0 });
  const current = (home as { strategy?: Record<string, unknown> }).strategy;

  if (!force && !isStrategyEmpty(current)) {
    console.log(`[${locale}] Stratégie déjà renseignée — ignoré (utilisez --force)`);
    return;
  }

  await payload.updateGlobal({
    slug: "home",
    locale,
    data: { strategy: data },
    depth: 0,
  });

  console.log(`[${locale}] Stratégie initialisée.`);
}

const payload = await getPayloadClient();
await seedLocale(payload, "fr", DEFAULT_HOME_STRATEGY_FR);
await seedLocale(payload, "en", DEFAULT_HOME_STRATEGY_EN);
process.exit(0);
