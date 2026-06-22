/**
 * Génère les vignettes poster pour les vidéos existantes sans sizes.poster.
 * Usage : npm run media:generate-video-posters
 */
import { getPayload } from "payload";

import { createVideoPosterForDoc } from "../src/hooks/generateVideoPoster";
import config from "../src/payload.config";

async function main() {
  const payload = await getPayload({ config });

  const { docs } = await payload.find({
    collection: "media",
    where: {
      mimeType: { like: "video/%" },
    },
    limit: 200,
    depth: 0,
  });

  let updated = 0;
  let skipped = 0;

  for (const doc of docs) {
    if (!doc.filename || typeof doc.filename !== "string") continue;

    const sizes = doc.sizes as { poster?: { filename?: string } } | undefined;
    if (sizes?.poster?.filename) {
      skipped += 1;
      continue;
    }

    await createVideoPosterForDoc(payload, {
      id: doc.id,
      filename: doc.filename,
      mimeType: doc.mimeType,
      prefix: doc.prefix,
      sizes: doc.sizes,
    });

    updated += 1;
    console.log(`Poster généré : ${doc.filename} (id ${doc.id})`);
  }

  console.log(`Terminé — ${updated} mis à jour, ${skipped} déjà avec poster.`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
