/** Provinces de la RDC présentes sur la carte SVG (groupe « Provinces »). */
export const DRC_MAP_PROVINCES = [
  "Kinshasa",
  "Kongo-Central",
  "Kwango",
  "Kwilu",
  "Kasaï",
  "Maï-Ndombe",
  "Équateur",
  "Sud-Ubangi",
  "Nord-Ubangi",
  "Mongala",
  "Tshuapa",
  "Sankuru",
  "Kasaï Oriental",
  "Kasaï Central",
  "Lualaba",
  "Haut-Lomami",
  "Lomami",
  "Tanganyika",
  "Kaut-Katanga",
  "Sud-Kivu",
  "Maniema",
  "Tshopo",
  "Ituri",
  "Nord-Kivu",
  "Bas-Uele",
  "Haut-Uele",
] as const;

export type DrcMapProvince = (typeof DRC_MAP_PROVINCES)[number];

/** Provinces sans déploiement IGM (26 − 22). */
export const UNDEPLOYED_MAP_PROVINCES = [
  "Nord-Ubangi",
  "Mongala",
  "Kwango",
  "Lomami",
] as const satisfies readonly DrcMapProvince[];

export const DEPLOYED_PROVINCES_COUNT = DRC_MAP_PROVINCES.length - UNDEPLOYED_MAP_PROVINCES.length;

type LocalizedLabel = { fr: string; en: string };

export type ProvinceMapMeta = {
  deployed: boolean;
  chefLieu: LocalizedLabel;
};

const EN_LABELS: Partial<Record<DrcMapProvince, string>> = {
  "Kongo-Central": "Kongo Central",
  "Maï-Ndombe": "Mai-Ndombe",
  Équateur: "Equateur",
  Kasaï: "Kasai",
  "Kasaï Oriental": "Kasai Oriental",
  "Kasaï Central": "Kasai Central",
  "Kaut-Katanga": "Haut-Katanga",
};

const UNDEPLOYED_SET = new Set<DrcMapProvince>(UNDEPLOYED_MAP_PROVINCES);

const PROVINCE_META: Record<DrcMapProvince, Omit<ProvinceMapMeta, "deployed">> = {
  Kinshasa: { chefLieu: { fr: "Kinshasa", en: "Kinshasa" } },
  "Kongo-Central": { chefLieu: { fr: "Matadi", en: "Matadi" } },
  Kwango: { chefLieu: { fr: "Kenge", en: "Kenge" } },
  Kwilu: { chefLieu: { fr: "Kikwit", en: "Kikwit" } },
  Kasaï: { chefLieu: { fr: "Luebo", en: "Luebo" } },
  "Maï-Ndombe": { chefLieu: { fr: "Inongo", en: "Inongo" } },
  Équateur: { chefLieu: { fr: "Mbandaka", en: "Mbandaka" } },
  "Sud-Ubangi": { chefLieu: { fr: "Gemena", en: "Gemena" } },
  "Nord-Ubangi": { chefLieu: { fr: "Gbadolite", en: "Gbadolite" } },
  Mongala: { chefLieu: { fr: "Lisala", en: "Lisala" } },
  Tshuapa: { chefLieu: { fr: "Boende", en: "Boende" } },
  Sankuru: { chefLieu: { fr: "Lusambo", en: "Lusambo" } },
  "Kasaï Oriental": { chefLieu: { fr: "Mbuji-Mayi", en: "Mbuji-Mayi" } },
  "Kasaï Central": { chefLieu: { fr: "Kananga", en: "Kananga" } },
  Lualaba: { chefLieu: { fr: "Kolwezi", en: "Kolwezi" } },
  "Haut-Lomami": { chefLieu: { fr: "Kamina", en: "Kamina" } },
  Lomami: { chefLieu: { fr: "Kabinda", en: "Kabinda" } },
  Tanganyika: { chefLieu: { fr: "Kalemie", en: "Kalemie" } },
  "Kaut-Katanga": { chefLieu: { fr: "Lubumbashi", en: "Lubumbashi" } },
  "Sud-Kivu": { chefLieu: { fr: "Bukavu", en: "Bukavu" } },
  Maniema: { chefLieu: { fr: "Kindu", en: "Kindu" } },
  Tshopo: { chefLieu: { fr: "Kisangani", en: "Kisangani" } },
  Ituri: { chefLieu: { fr: "Bunia", en: "Bunia" } },
  "Nord-Kivu": { chefLieu: { fr: "Goma", en: "Goma" } },
  "Bas-Uele": { chefLieu: { fr: "Buta", en: "Buta" } },
  "Haut-Uele": { chefLieu: { fr: "Isiro", en: "Isiro" } },
};

/** Ajustements fins du marqueur (coords SVG, y positif = vers le bas). */
const PROVINCE_MARKER_OFFSET: Partial<Record<DrcMapProvince, { x: number; y: number }>> = {
  "Kongo-Central": { x: 0, y: -18 },
  "Kasaï Central": { x: 0, y: 55 },
  Lomami: { x: 22, y: 0 },
  Lualaba: { x: -38, y: 0 },
};

export function provinceMarkerOffset(name: DrcMapProvince): { x: number; y: number } {
  return PROVINCE_MARKER_OFFSET[name] ?? { x: 0, y: 0 };
}

export function provinceLabel(name: DrcMapProvince, locale: "fr" | "en"): string {
  if (locale === "en" && EN_LABELS[name]) return EN_LABELS[name]!;
  return name;
}

export function provinceChefLieu(name: DrcMapProvince, locale: "fr" | "en"): string {
  const meta = PROVINCE_META[name];
  return locale === "en" ? meta.chefLieu.en : meta.chefLieu.fr;
}

export function isProvinceDeployed(name: DrcMapProvince): boolean {
  return !UNDEPLOYED_SET.has(name);
}

export function getProvinceMapMeta(name: DrcMapProvince): ProvinceMapMeta {
  return {
    ...PROVINCE_META[name],
    deployed: isProvinceDeployed(name),
  };
}

export function isDrcMapProvince(value: string | null | undefined): value is DrcMapProvince {
  return Boolean(value && DRC_MAP_PROVINCES.includes(value as DrcMapProvince));
}

export function isDeployedMapProvince(value: DrcMapProvince | null | undefined): value is DrcMapProvince {
  return Boolean(value && isProvinceDeployed(value));
}
