import type { Field } from "payload";

import { CUSTOM_NAV_LINK_VALUE, SITE_NAV_LINK_OPTIONS } from "@/lib/siteNavLinks";
import { LOCALIZED } from "./localized";

/** Champs CTA bannière : libellé + lien du menu du site. */
export const bannerCtaFields: Field[] = [
  {
    name: "label",
    type: "text",
    label: "Libellé",
    ...LOCALIZED,
  },
  {
    name: "navLink",
    type: "select",
    label: "Page du site",
    options: [...SITE_NAV_LINK_OPTIONS],
    admin: {
      description: "Sélectionnez une page du menu du site.",
    },
  },
  {
    name: "customHref",
    type: "text",
    label: "URL personnalisée",
    admin: {
      condition: (_, siblingData) => siblingData?.navLink === CUSTOM_NAV_LINK_VALUE,
      description: "Ex. https://…, mailto:…, ou un chemin non listé.",
    },
  },
];
