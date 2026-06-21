import type {
  CmsGlobalResponse,
  CmsListResponse,
  CmsNews,
  CmsPage,
  CmsSiteSettings,
  CmsStat,
} from "./types";

const DEFAULT_REVALIDATE = 60;

function cmsBaseUrl(): string | null {
  const raw = process.env.CMS_API_URL?.trim();
  if (!raw) return null;
  return raw.replace(/\/$/, "");
}

type FetchOptions = {
  revalidate?: number | false;
  tags?: string[];
};

async function cmsFetch<T>(path: string, options: FetchOptions = {}): Promise<T | null> {
  const base = cmsBaseUrl();
  if (!base) return null;

  const url = `${base}${path.startsWith("/") ? path : `/${path}`}`;
  const headers = new Headers({ Accept: "application/json" });

  const token = process.env.CMS_API_TOKEN?.trim();
  if (token) {
    headers.set("Authorization", `users API-Key ${token}`);
  }

  const next: RequestInit["next"] = {};
  if (options.tags?.length) next.tags = options.tags;
  if (options.revalidate === false) {
    next.revalidate = 0;
  } else {
    next.revalidate = options.revalidate ?? DEFAULT_REVALIDATE;
  }

  try {
    const res = await fetch(url, { headers, next });
    if (!res.ok) {
      console.error(`[cms] ${res.status} ${url}`);
      return null;
    }
    return (await res.json()) as T;
  } catch (err) {
    console.error("[cms] fetch error:", err);
    return null;
  }
}

export async function getSiteSettings(): Promise<CmsSiteSettings | null> {
  const data = await cmsFetch<CmsGlobalResponse<CmsSiteSettings>>("/globals/site-settings", {
    tags: ["global:site-settings"],
  });
  return data ?? null;
}

export async function getPageBySlug(slug: string): Promise<CmsPage | null> {
  const data = await cmsFetch<CmsListResponse<CmsPage>>(
    `/pages?limit=1&where[slug][equals]=${encodeURIComponent(slug)}&depth=1`,
    { tags: [`page:${slug}`, "collection:pages"] },
  );
  return data?.docs?.[0] ?? null;
}

export async function getPublishedNews(limit = 6): Promise<CmsNews[]> {
  const data = await cmsFetch<CmsListResponse<CmsNews>>(
    `/news?limit=${limit}&sort=-publishedAt&depth=1`,
    { tags: ["collection:news"] },
  );
  return data?.docs ?? [];
}

export async function getStats(): Promise<CmsStat[]> {
  const data = await cmsFetch<CmsListResponse<CmsStat>>(
    "/stats?limit=100&sort=order",
    { tags: ["collection:stats"] },
  );
  return data?.docs ?? [];
}

export function isCmsConfigured(): boolean {
  return Boolean(cmsBaseUrl());
}
