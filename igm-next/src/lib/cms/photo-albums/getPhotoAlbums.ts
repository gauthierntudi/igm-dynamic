import { unstable_cache } from "next/cache";

import type { SupportedLocale } from "@/i18n/locales";

import { hydrateMediaFields, hydrateMediaList, hydrateMediaRef } from "../hydrateMediaRefs";
import { getPayloadClient } from "../payload";
import type { CmsMedia } from "../types";
import type { CmsPhotoAlbum, CmsPhotoAlbumPhoto } from "./types";

function hasDatabase(): boolean {
  return Boolean(process.env.DATABASE_URI?.trim() || process.env.DATABASE_URL?.trim());
}

function isPhotoRow(value: unknown): value is CmsPhotoAlbumPhoto {
  return Boolean(value && typeof value === "object" && "image" in value);
}

async function hydratePhotoAlbum(doc: CmsPhotoAlbum): Promise<CmsPhotoAlbum> {
  const withRelations = await hydrateMediaFields(doc, ["coverImage"] as (keyof CmsPhotoAlbum)[]);
  if (!withRelations) return doc;

  const rawPhotos = withRelations.photos ?? [];
  if (!rawPhotos.length) {
    return { ...withRelations, photos: [] };
  }

  // Ancien format hasMany : liste de media / ids.
  if (!isPhotoRow(rawPhotos[0])) {
    return {
      ...withRelations,
      photos: await hydrateMediaList(rawPhotos as (CmsMedia | number)[]),
    };
  }

  const hydratedRows = await Promise.all(
    (rawPhotos as CmsPhotoAlbumPhoto[]).map(async (row) => {
      const image = await hydrateMediaRef(row.image);
      return {
        ...row,
        image: image && typeof image === "object" ? image : row.image,
      };
    }),
  );

  return {
    ...withRelations,
    photos: hydratedRows,
  };
}

async function fetchPhotoAlbums(locale: SupportedLocale): Promise<CmsPhotoAlbum[]> {
  if (!hasDatabase()) return [];

  try {
    const payload = await getPayloadClient();
    const result = await payload.find({
      collection: "photo-albums",
      locale,
      depth: 2,
      limit: 200,
      sort: "-publishedAt,order",
      where: {
        _status: { equals: "published" },
      },
    });

    const docs = result.docs as CmsPhotoAlbum[];
    return Promise.all(docs.map(hydratePhotoAlbum));
  } catch (error) {
    console.error("[cms] getPhotoAlbums:", error);
    return [];
  }
}

async function fetchPhotoAlbumBySlug(
  slug: string,
  locale: SupportedLocale,
): Promise<CmsPhotoAlbum | null> {
  if (!hasDatabase()) return null;

  try {
    const payload = await getPayloadClient();
    const result = await payload.find({
      collection: "photo-albums",
      locale,
      depth: 2,
      limit: 1,
      where: {
        and: [
          { _status: { equals: "published" } },
          { slug: { equals: slug } },
        ],
      },
    });

    const doc = result.docs[0] as CmsPhotoAlbum | undefined;
    if (!doc) return null;
    return hydratePhotoAlbum(doc);
  } catch (error) {
    console.error("[cms] getPhotoAlbumBySlug:", error);
    return null;
  }
}

const albumsCacheByLocale = new Map<string, () => Promise<CmsPhotoAlbum[]>>();
const albumBySlugCache = new Map<string, () => Promise<CmsPhotoAlbum | null>>();

function getAlbumsCached(locale: SupportedLocale) {
  const key = locale;
  if (!albumsCacheByLocale.has(key)) {
    albumsCacheByLocale.set(
      key,
      unstable_cache(() => fetchPhotoAlbums(locale), ["cms-photo-albums", locale], {
        tags: ["collection:photo-albums", `collection:photo-albums:${locale}`],
      }),
    );
  }
  return albumsCacheByLocale.get(key)!;
}

function getAlbumBySlugCached(slug: string, locale: SupportedLocale) {
  const key = `${slug}:${locale}`;
  if (!albumBySlugCache.has(key)) {
    albumBySlugCache.set(
      key,
      unstable_cache(
        () => fetchPhotoAlbumBySlug(slug, locale),
        ["cms-photo-album", slug, locale],
        {
          tags: [
            "collection:photo-albums",
            `collection:photo-albums:${locale}`,
            `photo-album:slug:${slug}`,
            `photo-album:slug:${slug}:${locale}`,
          ],
        },
      ),
    );
  }
  return albumBySlugCache.get(key)!;
}

export async function getPhotoAlbums(locale: SupportedLocale): Promise<CmsPhotoAlbum[]> {
  if (process.env.NODE_ENV === "development") {
    return fetchPhotoAlbums(locale);
  }
  return getAlbumsCached(locale)();
}

export async function getPhotoAlbumBySlug(
  slug: string,
  locale: SupportedLocale,
): Promise<CmsPhotoAlbum | null> {
  if (process.env.NODE_ENV === "development") {
    return fetchPhotoAlbumBySlug(slug, locale);
  }
  return getAlbumBySlugCached(slug, locale)();
}
