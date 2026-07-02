import { buildMatchContext } from "./buildContext";
import { routeMatchers } from "./matchers";
import type { ResolveSiteRouteInput } from "./types";
import type { SiteRoute } from "../types";

export type { ResolveSiteRouteInput } from "./types";

export async function resolveSiteRoute(input: ResolveSiteRouteInput): Promise<SiteRoute> {
  const ctx = buildMatchContext(input.segments);

  for (const matcher of routeMatchers) {
    const route = await matcher(ctx, input);
    if (route) {
      return route;
    }
  }

  return { kind: "under-construction", ...ctx };
}
