/**
 * Sur cPanel, l’URL peut être un sous-chemin (ex. gauthierntudi.com/igm).
 * Définir BASE_PATH=/igm avant `next build` et dans les variables d’environnement Node.
 * Laisser vide sur Vercel / dev local (racine `/`).
 */
export function deployedBasePath(): string | undefined {
  const raw = process.env.BASE_PATH?.trim();
  if (!raw || raw === "/") return undefined;
  let b = raw.replace(/\/$/, "");
  if (!b.startsWith("/")) {
    b = `/${b}`;
  }
  return b;
}

/** Préfixe chemins absolus site (ex. `/assets/...`) pour le sous-dossier Passenger. */
export function withDeployedBase(absPath: string): string {
  if (!absPath.startsWith("/") || absPath.startsWith("//")) return absPath;
  const base = deployedBasePath();
  if (!base) return absPath;
  if (absPath === base || absPath.startsWith(`${base}/`)) return absPath;
  return `${base}${absPath}`;
}
