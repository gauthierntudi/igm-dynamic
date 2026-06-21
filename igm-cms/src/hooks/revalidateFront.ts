import type { CollectionAfterChangeHook, GlobalAfterChangeHook } from "payload";

async function pingFrontRevalidate(tags: string[]) {
  const url = process.env.FRONT_REVALIDATE_URL?.trim();
  const secret = process.env.FRONT_REVALIDATE_SECRET?.trim();
  if (!url || !secret) return;

  try {
    await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${secret}`,
      },
      body: JSON.stringify({ tags }),
    });
  } catch (err) {
    console.error("[igm-cms] Revalidation front échouée:", err);
  }
}

export const revalidateFrontCollection: CollectionAfterChangeHook = ({ collection, doc }) => {
  void pingFrontRevalidate([`collection:${collection.slug}`, `doc:${collection.slug}:${doc.id}`]);
  return doc;
};

export const revalidateFrontGlobal: GlobalAfterChangeHook = ({ global, doc }) => {
  void pingFrontRevalidate([`global:${global.slug}`]);
  return doc;
};
