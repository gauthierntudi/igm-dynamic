import type { RouteContext, SiteRoute } from "../types";

export type ResolveSiteRouteInput = {
  segments: string[];
  page?: string;
  q?: string;
};

export type MatchContext = RouteContext;

export type RouteMatcher = (
  ctx: MatchContext,
  input: ResolveSiteRouteInput,
) => Promise<SiteRoute | null> | SiteRoute | null;
