import { getPayloadClient } from "./payload";
import type { CmsMedia } from "./types";

type MediaRef = CmsMedia | number | null | undefined;

function mediaId(value: MediaRef): number | null {
  if (typeof value === "number") return value;
  if (!value || typeof value !== "object") return null;
  if (typeof value.id === "number") return value.id;
  if (typeof value.id === "string") {
    const parsed = Number(value.id);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function isMediaResolvable(value: MediaRef): boolean {
  if (!value || typeof value !== "object") return false;
  if (!value.filename?.trim() && !value.url?.trim()) return false;

  if (value.mimeType?.startsWith("video/")) {
    return value.sizes !== undefined;
  }

  return true;
}

async function fetchMediaById(id: number): Promise<CmsMedia | null> {
  try {
    const payload = await getPayloadClient();
    return (await payload.findByID({
      collection: "media",
      id,
      depth: 0,
    })) as CmsMedia;
  } catch {
    return null;
  }
}

/** Résout une relation upload Payload lorsque seul l’ID numérique est renvoyé. */
export async function hydrateMediaRef(value: MediaRef): Promise<MediaRef> {
  const id = mediaId(value);
  if (id == null) return value;
  if (isMediaResolvable(value)) return value;
  return (await fetchMediaById(id)) ?? value;
}

/** Peuple les champs upload d’un document quand findGlobal/find renvoie des IDs. */
export async function hydrateMediaFields<T extends Record<string, unknown>>(
  doc: T | null | undefined,
  fields: readonly (keyof T)[],
): Promise<T | null> {
  if (!doc) return null;

  const idsToFetch = new Set<number>();
  for (const field of fields) {
    const value = doc[field] as MediaRef;
    const id = mediaId(value);
    if (id != null && !isMediaResolvable(value)) idsToFetch.add(id);
  }

  if (idsToFetch.size === 0) return doc;

  const byId = new Map<number, CmsMedia>();
  await Promise.all(
    [...idsToFetch].map(async (id) => {
      const media = await fetchMediaById(id);
      if (media) byId.set(id, media);
    }),
  );

  const next = { ...doc };
  for (const field of fields) {
    const value = next[field] as MediaRef;
    const id = mediaId(value);
    if (id == null) continue;
    const media = byId.get(id);
    if (media) next[field] = media as T[keyof T];
  }

  return next;
}

/** Peuple une liste de relations upload (hasMany). */
export async function hydrateMediaList(
  values: (CmsMedia | number | null | undefined)[] | null | undefined,
): Promise<CmsMedia[]> {
  if (!values?.length) return [];

  const hydrated = await Promise.all(values.map((value) => hydrateMediaRef(value)));
  return hydrated.filter((value): value is CmsMedia => value != null && typeof value === "object");
}
