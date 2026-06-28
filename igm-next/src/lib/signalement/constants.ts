export const MAX_SIGNALEMENT_FILE_BYTES = 5 * 1024 * 1024;
export const MAX_SIGNALEMENT_FILES = 12;
export const MAX_SIGNALEMENT_TOTAL_BYTES = 15 * 1024 * 1024;

export const PROVINCES_RDC = [
  "Bas-Uele",
  "Équateur",
  "Haut-Katanga",
  "Haut-Lomami",
  "Haut-Uele",
  "Ituri",
  "Kasaï",
  "Kasaï-Central",
  "Kasaï-Oriental",
  "Kinshasa",
  "Kongo-Central",
  "Kwango",
  "Kwilu",
  "Lomami",
  "Lualaba",
  "Mai-Ndombe",
  "Maniema",
  "Mongala",
  "Nord-Kivu",
  "Nord-Ubangi",
  "Sankuru",
  "Sud-Kivu",
  "Sud-Ubangi",
  "Tanganyika",
  "Tshopo",
  "Tshuapa",
] as const;

export const TYPES_INFRACTION = [
  "Exploitation illégale",
  "Contrebande",
  "Sous-déclaration",
  "Corruption",
  "Non-respect des obligations légales",
  "Autre",
] as const;

export type ProvinceRdc = (typeof PROVINCES_RDC)[number];
export type TypeInfraction = (typeof TYPES_INFRACTION)[number];

export function isProvinceRdc(value: string): value is ProvinceRdc {
  return (PROVINCES_RDC as readonly string[]).includes(value);
}

export function isTypeInfraction(value: string): value is TypeInfraction {
  return (TYPES_INFRACTION as readonly string[]).includes(value);
}

export function isAllowedSignalementMime(mime: string, filename: string): boolean {
  const normalized = mime.toLowerCase();
  if (normalized === "image/jpeg" || normalized === "image/png") return true;
  if (normalized.startsWith("audio/")) return true;
  if (/\.(webm|mp3|wav|m4a|ogg)$/i.test(filename)) return true;
  return false;
}

export function buildSignalementReference(): string {
  const now = new Date();
  const stamp = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("");
  const suffix = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `SIG-${stamp}-${suffix}`;
}
