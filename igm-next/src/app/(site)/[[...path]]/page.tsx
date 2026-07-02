import type { Metadata } from "next";

import { buildRouteMetadata } from "@/lib/routing/buildRouteMetadata";
import { resolveSiteRoute } from "@/lib/routing/resolveSiteRoute";
import { renderSiteRoute } from "@/lib/routing/renderSiteRoute";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ path?: string[] }>;
}): Promise<Metadata> {
  const { path: segments = [] } = await params;
  const route = await resolveSiteRoute({ segments });
  return buildRouteMetadata(route);
}

export default async function TemplatePage({
  params,
  searchParams,
}: {
  params: Promise<{ path?: string[] }>;
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  const { path: segments = [] } = await params;
  const { page: pageParam, q: qParam } = await searchParams;
  const route = await resolveSiteRoute({
    segments,
    page: pageParam,
    q: qParam,
  });
  return renderSiteRoute(route);
}
