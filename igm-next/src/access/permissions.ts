/** Rôles admin et autorisations configurables. */

export const ROLES = {
  superAdmin: "super-admin",
  technique: "technique",
  signalements: "signalements",
  publication: "publication",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const CONFIGURABLE_ROLES = [ROLES.technique, ROLES.signalements, ROLES.publication] as const;

export type ConfigurableRole = (typeof CONFIGURABLE_ROLES)[number];

export const ROLE_OPTIONS: { label: string; value: Role }[] = [
  { label: "Super Admin", value: ROLES.superAdmin },
  { label: "Administrateur technique", value: ROLES.technique },
  { label: "Gestionnaire des signalements", value: ROLES.signalements },
  { label: "Responsable de publication", value: ROLES.publication },
];

export const ROLE_LABELS: Record<Role, string> = {
  [ROLES.superAdmin]: "Super Admin",
  [ROLES.technique]: "Administrateur technique",
  [ROLES.signalements]: "Gestionnaire des signalements",
  [ROLES.publication]: "Responsable de publication",
};

export const PERMISSION_GROUPS = [
  {
    label: "Administration",
    permissions: [
      {
        key: "users",
        label: "Utilisateurs",
        description: "Créer, modifier et supprimer les comptes, et leur attribuer un rôle.",
      },
      {
        key: "autorisations",
        label: "Autorisations",
        description: "Ouvrir cette page et modifier les droits de chaque rôle.",
      },
      {
        key: "siteSettings",
        label: "Paramètres du site",
        description: "Menu, coordonnées et pied de page.",
      },
    ],
  },
  {
    label: "Signalements",
    permissions: [
      {
        key: "signalements",
        label: "Signalements",
        description: "Consulter les dossiers, mettre à jour le statut et les notes, et accéder aux fichiers joints.",
      },
      {
        key: "contactMessages",
        label: "Messages contact",
        description: "Lire et traiter les messages du formulaire de contact.",
      },
    ],
  },
  {
    label: "Contenu",
    permissions: [
      { key: "pages", label: "Pages", description: "Pages CMS du site." },
      { key: "news", label: "Actualités", description: "Articles et revue de presse." },
      { key: "stats", label: "Chiffres clés", description: "Indicateurs affichés sur le site." },
      {
        key: "legislationDocuments",
        label: "Documents législation",
        description: "Textes officiels (ordonnances, lois, décrets, arrêtés, décisions).",
      },
      { key: "mediaGallery", label: "Vidéos médiathèque", description: "Vidéos publiées sur /videos." },
      { key: "photoAlbums", label: "Albums photos", description: "Albums publiés sur /photos." },
      { key: "media", label: "Médias publics", description: "Images, PDF et fichiers utilisés par le site." },
      { key: "home", label: "Page d'accueil", description: "Contenu éditorial de l'accueil." },
      { key: "whoWeAre", label: "Page À propos", description: "Contenu de Qui sommes-nous." },
      { key: "legislation", label: "Pages Législation", description: "Bannières des pages législation." },
      { key: "pageHeroes", label: "Bannières de pages", description: "Images et textes des bandeaux." },
      { key: "contactPage", label: "Page Contact", description: "Textes de la page contact." },
      { key: "pressKit", label: "Dossier de presse", description: "PDF et textes du dossier de presse." },
      { key: "cartography", label: "Cartographie", description: "Provinces et inspecteurs." },
    ],
  },
] as const;

export type PermissionKey = (typeof PERMISSION_GROUPS)[number]["permissions"][number]["key"];

export const PERMISSION_KEYS = PERMISSION_GROUPS.flatMap((group) =>
  group.permissions.map((permission) => permission.key),
) as PermissionKey[];

const TECHNICAL_PERMISSIONS = new Set<PermissionKey>(["siteSettings", "media"]);

const PUBLICATION_PERMISSIONS = new Set<PermissionKey>([
  "pages",
  "news",
  "stats",
  "legislationDocuments",
  "mediaGallery",
  "photoAlbums",
  "media",
  "home",
  "whoWeAre",
  "legislation",
  "pageHeroes",
  "contactPage",
  "pressKit",
  "cartography",
]);

export type RoleGrants = Record<PermissionKey, boolean>;

export type Grants = Record<ConfigurableRole, RoleGrants>;

const ROLE_VALUES = new Set<string>(Object.values(ROLES));

export function isRole(value: unknown): value is Role {
  return typeof value === "string" && ROLE_VALUES.has(value);
}

export function isConfigurableRole(value: unknown): value is ConfigurableRole {
  return (CONFIGURABLE_ROLES as readonly string[]).includes(String(value));
}

export function getRole(user: unknown): Role | null {
  if (!user || typeof user !== "object" || !("role" in user)) return null;
  const role = (user as { role?: unknown }).role;
  return isRole(role) ? role : null;
}

/**
 * Rôle utilisé par le menu admin (synchrone).
 * Un jeton émis avant l'ajout du champ rôle n'a pas de rôle : ces comptes
 * existants sont Super Admin jusqu'à la prochaine connexion.
 */
export function roleForNav(user: unknown): Role | null {
  if (!user || typeof user !== "object" || !("id" in user)) return null;
  const role = getRole(user);
  if (role) return role;
  if (!("role" in user) || (user as { role?: unknown }).role == null) return ROLES.superAdmin;
  return null;
}

function emptyGrants(): RoleGrants {
  return Object.fromEntries(PERMISSION_KEYS.map((key) => [key, false])) as RoleGrants;
}

export function defaultGrants(): Grants {
  const technique = emptyGrants();
  for (const key of TECHNICAL_PERMISSIONS) technique[key] = true;

  const signalements = emptyGrants();
  signalements.signalements = true;

  const publication = emptyGrants();
  for (const key of PUBLICATION_PERMISSIONS) publication[key] = true;

  return { technique, signalements, publication };
}

export function normalizeGrants(input: unknown): Grants {
  const grants = defaultGrants();
  if (!input || typeof input !== "object") return grants;

  const source = input as Record<string, unknown>;
  for (const role of CONFIGURABLE_ROLES) {
    const row = source[role];
    if (!row || typeof row !== "object") continue;
    const record = row as Record<string, unknown>;
    for (const key of PERMISSION_KEYS) {
      if (typeof record[key] === "boolean") grants[role][key] = record[key];
    }
  }
  return grants;
}

export function roleHasPermission(role: Role | null, permission: PermissionKey, grants: Grants): boolean {
  if (!role) return false;
  if (role === ROLES.superAdmin) return true;
  return grants[role][permission] === true;
}
