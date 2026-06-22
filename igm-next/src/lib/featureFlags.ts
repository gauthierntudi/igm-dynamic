/** Lit un booléen depuis `.env` (`true` / `false`), sinon la valeur par défaut. */
export function envFlag(name: string, defaultValue: boolean): boolean {
  const raw = process.env[name]?.trim().toLowerCase();
  if (raw === "true" || raw === "1" || raw === "yes") return true;
  if (raw === "false" || raw === "0" || raw === "no") return false;
  return defaultValue;
}

/** Section « Impacts et résultats » sur la page d’accueil. */
export function isHomeStatsSectionVisible(): boolean {
  return envFlag("HOME_STATS_SECTION_VISIBLE", false);
}

/** Carrousel de cartes sous l’organigramme (désactivé — mélange personnes / départements). */
export function isHomeOrgChartUnitsVisible(): boolean {
  return envFlag("HOME_ORG_CHART_UNITS_VISIBLE", false);
}
