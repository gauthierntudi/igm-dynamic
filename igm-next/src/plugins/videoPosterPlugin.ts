import type { Plugin } from "payload";

import { generateVideoPoster } from "@/hooks/generateVideoPoster";

/** Génère une vignette poster après upload S3 (vidéos uniquement). */
export function videoPosterPlugin(): Plugin {
  return (config) => ({
    ...config,
    collections: (config.collections ?? []).map((collection) => {
      if (collection.slug !== "media") return collection;

      return {
        ...collection,
        hooks: {
          ...collection.hooks,
          afterChange: [...(collection.hooks?.afterChange ?? []), generateVideoPoster],
        },
      };
    }),
  });
}
