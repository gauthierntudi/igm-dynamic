/**
 * Remplit la section Organigramme de la page d'accueil si elle est vide.
 * Usage: npm run seed:home-orgchart
 *        npm run seed:home-orgchart:force
 */
import {
  DEFAULT_HOME_ORG_CHART_EN,
  DEFAULT_HOME_ORG_CHART_FR,
} from "../src/lib/cms/defaultHomeOrgChartSeed";
import { getPayloadClient } from "../src/lib/cms/payload";

const force = process.argv.includes("--force");

function isOrgChartEmpty(
  orgChart: Record<string, unknown> | null | undefined,
): boolean {
  if (!orgChart) return true;
  return !orgChart.titlePrefix && !orgChart.titleHighlight && !orgChart.lead && !orgChart.ctaLabel;
}

async function seedLocale(
  payload: Awaited<ReturnType<typeof getPayloadClient>>,
  locale: "fr" | "en",
  data: typeof DEFAULT_HOME_ORG_CHART_FR,
) {
  const home = await payload.findGlobal({ slug: "home", locale, depth: 0 });
  const current = (home as { orgChartSection?: Record<string, unknown> }).orgChartSection;

  if (!force && !isOrgChartEmpty(current)) {
    console.log(`[${locale}] Organigramme déjà renseigné — ignoré (utilisez --force)`);
    return;
  }

  await payload.updateGlobal({
    slug: "home",
    locale,
    data: { orgChartSection: data },
    depth: 0,
  });

  console.log(`[${locale}] Organigramme initialisé.`);
}

const payload = await getPayloadClient();
await seedLocale(payload, "fr", DEFAULT_HOME_ORG_CHART_FR);
await seedLocale(payload, "en", DEFAULT_HOME_ORG_CHART_EN);
process.exit(0);
