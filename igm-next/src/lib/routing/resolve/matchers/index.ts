import type { RouteMatcher } from "../types";

import { matchCmsRoutes } from "./cms";
import { matchHomeRoute } from "./home";
import { matchNewsRoutes } from "./news";
import { matchPhotoRoutes } from "./photos";
import { matchStaticRoutes } from "./staticRoutes";
import { matchWhoWeAreRoutes } from "./whoWeAre";

/** Matchers run in order — first non-null result wins. */
export const routeMatchers: RouteMatcher[] = [
  matchHomeRoute,
  matchNewsRoutes,
  matchWhoWeAreRoutes,
  matchPhotoRoutes,
  matchStaticRoutes,
  matchCmsRoutes,
];
