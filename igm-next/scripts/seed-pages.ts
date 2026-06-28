/**
 * Initialise ou met à jour les pages CMS (ex. fraude minière).
 * Usage: npm run seed:pages
 *        npm run seed:pages:force
 */
import {
  DEFAULT_PAGE_SEED_PAIRS,
  type DefaultPageSeed,
} from "../src/lib/cms/defaultPagesSeed";
import { getPayloadClient } from "../src/lib/cms/payload";

const force = process.argv.includes("--force");

function pageData(seed: DefaultPageSeed) {
  return {
    title: seed.title,
    slug: seed.slug,
    summary: seed.summary,
    hero: {
      eyebrow: seed.hero?.eyebrow,
      title: seed.hero?.title,
      lead: seed.hero?.lead,
      ctaLabel: seed.hero?.ctaLabel,
      ctaHref: seed.hero?.ctaHref,
    },
    contentHtml: seed.contentHtml,
    seoTitle: seed.seoTitle,
    seoDescription: seed.seoDescription,
    _status: "published" as const,
  };
}

async function removeSlugConflicts(
  payload: Awaited<ReturnType<typeof getPayloadClient>>,
  slug: string,
  keepId: number | string,
  locale: "fr" | "en",
) {
  const conflicts = await payload.find({
    collection: "pages",
    locale,
    where: { slug: { equals: slug } },
    limit: 20,
    depth: 0,
  });

  for (const doc of conflicts.docs) {
    if (doc.id === keepId) continue;
    await payload.delete({ collection: "pages", id: doc.id });
    console.log(`Doublon supprimé (id ${doc.id}) — slug « ${slug} » [${locale}]`);
  }
}

async function seedPagePair(
  payload: Awaited<ReturnType<typeof getPayloadClient>>,
  fr: DefaultPageSeed,
  en: DefaultPageSeed,
) {
  const existing = await payload.find({
    collection: "pages",
    locale: "fr",
    where: { slug: { equals: fr.slug } },
    limit: 1,
    depth: 0,
  });

  if (existing.docs.length > 0 && !force) {
    console.log(`Page « ${fr.slug} » déjà présente — ignoré (utilisez --force)`);
    return;
  }

  let id: number | string;

  if (existing.docs.length > 0) {
    id = existing.docs[0].id;
    await payload.update({
      collection: "pages",
      id,
      locale: "fr",
      data: pageData(fr),
      depth: 0,
    });
    console.log(`Page « ${fr.slug} » (FR) mise à jour.`);
  } else {
    const created = await payload.create({
      collection: "pages",
      locale: "fr",
      data: pageData(fr),
      depth: 0,
    });
    id = created.id;
    console.log(`Page « ${fr.slug} » créée (FR).`);
  }

  await removeSlugConflicts(payload, en.slug, id, "en");
  await removeSlugConflicts(payload, fr.slug, id, "fr");

  await payload.update({
    collection: "pages",
    id,
    locale: "en",
    data: pageData(en),
    depth: 0,
  });
  console.log(`Traduction EN « ${en.slug} » enregistrée sur le même document.`);
}

const payload = await getPayloadClient();

for (const pair of DEFAULT_PAGE_SEED_PAIRS) {
  await seedPagePair(payload, pair.fr, pair.en);
}

process.exit(0);
