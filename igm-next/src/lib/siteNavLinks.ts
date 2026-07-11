/** Pages internes du site (menu principal). Source unique pour l’admin Payload. */
export const SITE_NAV_LINKS = [
  { label: "Accueil", value: "/" },
  { label: "Présentation — À propos", value: "/a-propos" },
  { label: "Présentation — Historique", value: "/historique" },
  { label: "Présentation — Mission", value: "/mission" },
  { label: "Présentation — Vision", value: "/vision" },
  { label: "Présentation — Organigramme", value: "/organigramme" },
  { label: "Présentation — Cartographie", value: "/cartographie" },
  { label: "LCFCM — Fraude minière", value: "/fraude-miniere" },
  { label: "LCFCM — Contrebande minière", value: "/contrebande-miniere" },
  { label: "LCFCM — Dénoncer", value: "/denoncer" },
  { label: "LCFCM — Sanctions", value: "/sanctions" },
  { label: "Actualités", value: "/actualites" },
  { label: "Législation — Ordonnances", value: "/ordonnances" },
  { label: "Législation — Lois", value: "/lois" },
  { label: "Législation — Décrets", value: "/decrets" },
  { label: "Législation — Décisions", value: "/decisions" },
  { label: "Multimédia — Photos", value: "/photos" },
  { label: "Multimédia — Vidéos", value: "/videos" },
  { label: "Multimédia — Dossier de presse", value: "/dossier-de-presse" },
  { label: "Multimédia — Revue de presse", value: "/revue-de-presse" },
  { label: "Contact", value: "/contact" },
] as const;

export const CUSTOM_NAV_LINK_VALUE = "__custom__" as const;

export const SITE_NAV_LINK_OPTIONS = [
  ...SITE_NAV_LINKS.map(({ label, value }) => ({ label, value })),
  { label: "— URL personnalisée —", value: CUSTOM_NAV_LINK_VALUE },
];
