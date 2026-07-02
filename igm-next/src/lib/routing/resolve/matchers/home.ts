import { isPublishedHomePage } from "../../pathUtils";
import type { RouteMatcher } from "../types";

export const matchHomeRoute: RouteMatcher = (ctx) => {
  if (isPublishedHomePage(ctx.pathSegments)) {
    return { kind: "home", ...ctx };
  }
  return null;
};
