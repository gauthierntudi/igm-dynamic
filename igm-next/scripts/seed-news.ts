/**
 * Crée des articles d'exemple et initialise la section Actualités de l'accueil.
 * Usage: npm run seed:news
 *        npm run seed:news:force
 */
import {
  DEFAULT_HOME_NEWS_SECTION_EN,
  DEFAULT_HOME_NEWS_SECTION_FR,
  DEFAULT_NEWS_EN,
  DEFAULT_NEWS_FR,
  type DefaultNewsArticleSeed,
} from "../src/lib/cms/defaultNewsSeed";
import { getPayloadClient } from "../src/lib/cms/payload";
import { slugifyTitle } from "../src/lib/slugify";

const force = process.argv.includes("--force");

function articleData(article: DefaultNewsArticleSeed) {
  return {
    title: article.title,
    slug: article.slug,
    excerpt: article.excerpt,
    category: article.category,
    categoryCustom: article.categoryCustom,
    publishedAt: article.publishedAt,
    contentHtml: article.contentHtml,
    _status: "published" as const,
  };
}

/** Supprime les anciens doublons (seed précédent : un doc par langue) qui bloquent l’unicité du slug. */
async function removeSlugConflicts(
  payload: Awaited<ReturnType<typeof getPayloadClient>>,
  slug: string,
  keepId: number | string,
  locale: "fr" | "en",
) {
  const conflicts = await payload.find({
    collection: "news",
    locale,
    where: { slug: { equals: slug } },
    limit: 20,
    depth: 0,
  });

  for (const doc of conflicts.docs) {
    if (doc.id === keepId) continue;
    await payload.delete({ collection: "news", id: doc.id });
    console.log(`Doublon supprimé (id ${doc.id}) — slug « ${slug} » [${locale}]`);
  }
}

async function seedPairedNewsArticles(payload: Awaited<ReturnType<typeof getPayloadClient>>) {
  const pairCount = Math.min(DEFAULT_NEWS_FR.length, DEFAULT_NEWS_EN.length);

  for (let index = 0; index < pairCount; index += 1) {
    const fr = DEFAULT_NEWS_FR[index];
    const en = DEFAULT_NEWS_EN[index];

    const existing = await payload.find({
      collection: "news",
      locale: "fr",
      where: { slug: { equals: fr.slug } },
      limit: 1,
      depth: 0,
    });

    if (existing.docs.length > 0 && !force) {
      console.log(`Actualité « ${fr.slug} » déjà présente — ignoré`);
      continue;
    }

    let id: number | string;

    if (existing.docs.length > 0) {
      id = existing.docs[0].id;
      await payload.update({
        collection: "news",
        id,
        locale: "fr",
        data: articleData(fr),
        depth: 0,
      });
      console.log(`Actualité « ${fr.slug} » (FR) mise à jour.`);
    } else {
      const created = await payload.create({
        collection: "news",
        locale: "fr",
        data: articleData(fr),
        depth: 0,
      });
      id = created.id;
      console.log(`Actualité « ${fr.slug} » créée (FR).`);
    }

    await removeSlugConflicts(payload, en.slug, id, "en");
    await removeSlugConflicts(payload, fr.slug, id, "fr");
    await removeSlugConflicts(payload, slugifyTitle(en.title), id, "en");
    await removeSlugConflicts(payload, slugifyTitle(fr.title), id, "fr");

    await payload.update({
      collection: "news",
      id,
      locale: "en",
      data: articleData(en),
      depth: 0,
    });
    console.log(`Traduction EN « ${en.slug} » enregistrée sur le même document.`);
  }
}

async function seedHomeNewsSection(
  payload: Awaited<ReturnType<typeof getPayloadClient>>,
  locale: "fr" | "en",
  data: typeof DEFAULT_HOME_NEWS_SECTION_FR,
) {
  const home = await payload.findGlobal({ slug: "home", locale, depth: 0 });
  const current = (home as { newsSection?: Record<string, unknown> }).newsSection;

  if (!force && current?.title) {
    console.log(`[${locale}] Section actualités accueil déjà renseignée — ignoré`);
    return;
  }

  await payload.updateGlobal({
    slug: "home",
    locale,
    data: { newsSection: data },
    depth: 0,
  });

  console.log(`[${locale}] Section actualités accueil initialisée.`);
}

const payload = await getPayloadClient();
await seedPairedNewsArticles(payload);
await seedHomeNewsSection(payload, "fr", DEFAULT_HOME_NEWS_SECTION_FR);
await seedHomeNewsSection(payload, "en", DEFAULT_HOME_NEWS_SECTION_EN);
process.exit(0);
