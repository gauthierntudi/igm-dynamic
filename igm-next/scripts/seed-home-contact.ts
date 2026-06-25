/**
 * Remplit la section Contact de la page d'accueil si elle est vide.
 * Usage: npm run seed:home-contact
 *        npm run seed:home-contact:force
 */
import {
  DEFAULT_HOME_CONTACT_EN,
  DEFAULT_HOME_CONTACT_FR,
} from "../src/lib/cms/defaultHomeContactSeed";
import { getPayloadClient } from "../src/lib/cms/payload";

const force = process.argv.includes("--force");

function isContactEmpty(contact: Record<string, unknown> | null | undefined): boolean {
  if (!contact) return true;
  return !contact.title;
}

async function seedLocale(
  payload: Awaited<ReturnType<typeof getPayloadClient>>,
  locale: "fr" | "en",
  data: typeof DEFAULT_HOME_CONTACT_FR,
) {
  const home = await payload.findGlobal({ slug: "home", locale, depth: 0 });
  const current = (home as { contactSection?: Record<string, unknown> }).contactSection;

  if (!force && !isContactEmpty(current)) {
    console.log(`[${locale}] Section contact déjà renseignée — ignoré (utilisez --force)`);
    return;
  }

  await payload.updateGlobal({
    slug: "home",
    locale,
    data: {
      contactSection: {
        ...(current ?? {}),
        ...data,
      },
    },
    depth: 0,
  });

  console.log(`[${locale}] Section contact initialisée.`);
}

const payload = await getPayloadClient();
await seedLocale(payload, "fr", DEFAULT_HOME_CONTACT_FR);
await seedLocale(payload, "en", DEFAULT_HOME_CONTACT_EN);
process.exit(0);
