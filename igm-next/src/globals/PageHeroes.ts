import type { GlobalConfig } from "payload";

import { isAdmin } from "../access/isAdmin";
import {
  PAGE_HERO_CTA_ROUTE_KEYS,
  PAGE_HERO_CTA_FIELD,
  PAGE_HERO_GROUP_LABELS,
  PAGE_HERO_GROUPS,
  PAGE_HERO_FIELD,
  type PageHeroCtaRouteKey,
  type PageHeroRouteKey,
} from "../lib/page-heroes/constants";
import { revalidateFrontGlobal } from "../hooks/revalidateFront";

const heroImageField = (name: string, label: string, description?: string) =>
  ({
    name,
    type: "upload",
    relationTo: "media",
    label,
    admin: {
      description:
        description ??
        "Image de fond de la bannière en haut de page (recommandé : paysage, ≥ 1920×600 px).",
    },
  }) as const;

const ctaHeroImageField = (routeKey: PageHeroCtaRouteKey, label: string) =>
  heroImageField(
    PAGE_HERO_CTA_FIELD[routeKey],
    `${label} — bandeau bas (CTA)`,
    "Image de fond du bandeau « acteur central » en bas de page. Repli : bannière du haut.",
  );

function fieldsForPage(routeKey: PageHeroRouteKey, label: string) {
  const fields = [heroImageField(PAGE_HERO_FIELD[routeKey], `${label} — bannière`)];
  if ((PAGE_HERO_CTA_ROUTE_KEYS as readonly string[]).includes(routeKey)) {
    fields.push(ctaHeroImageField(routeKey as PageHeroCtaRouteKey, label));
  }
  return fields;
}

export const PageHeroes: GlobalConfig = {
  slug: "page-heroes",
  label: "Bannières de pages",
  admin: {
    description:
      "Images de bannière pour les pages Présentation (IGM), LCFCM, Contact et Multimédia. Les pages Qui sommes-nous ? (À propos, Historique, Mission) se configurent dans « Page À propos ».",
    group: "Contenu",
  },
  access: {
    read: () => true,
    update: isAdmin,
  },
  hooks: {
    afterChange: [revalidateFrontGlobal],
  },
  fields: [
    {
      type: "tabs",
      tabs: Object.entries(PAGE_HERO_GROUPS).map(([groupKey, pages]) => ({
        label: PAGE_HERO_GROUP_LABELS[groupKey as keyof typeof PAGE_HERO_GROUP_LABELS],
        fields: pages.flatMap(({ routeKey, label }) => fieldsForPage(routeKey, label)),
      })),
    },
  ],
};
