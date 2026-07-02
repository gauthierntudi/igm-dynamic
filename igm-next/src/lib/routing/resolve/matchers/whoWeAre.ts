import { parseWhoWeAreSection } from "@/i18n/paths";

import type { RouteMatcher } from "../types";

export const matchWhoWeAreRoutes: RouteMatcher = (ctx) => {
  const whoWeAreSection = parseWhoWeAreSection(ctx.pathSegments, ctx.locale);
  if (whoWeAreSection === "history") {
    return { kind: "who-we-are-history", ...ctx };
  }

  if (whoWeAreSection) {
    return {
      kind: "who-we-are-section",
      section: whoWeAreSection,
      ...ctx,
    };
  }

  return null;
};
