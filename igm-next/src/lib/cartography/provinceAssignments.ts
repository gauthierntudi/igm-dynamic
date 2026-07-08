import {
  DRC_MAP_PROVINCES,
  isDrcMapProvince,
  isProvinceDeployed,
  type DrcMapProvince,
} from "./provinces";

import type { CmsCartographyInspector, CmsCartographyProvinceAssignment } from "@/lib/cms/cartography/types";

/** Provinces couvertes sur la carte (pin orange). */
export function getDeployedMapProvinces(): DrcMapProvince[] {
  return DRC_MAP_PROVINCES.filter((province) => isProvinceDeployed(province));
}

/** Garantit une entrée par province déployée, en conservant les inspecteurs déjà saisis. */
export function mergeDeployedProvinceAssignments(
  existing?: CmsCartographyProvinceAssignment[] | null,
): CmsCartographyProvinceAssignment[] {
  const byProvince = new Map<DrcMapProvince, CmsCartographyInspector[]>();

  for (const row of existing ?? []) {
    if (!row?.province || !isDrcMapProvince(row.province) || !isProvinceDeployed(row.province)) continue;
    const inspectors = (row.inspectors ?? []).filter((item) => item?.name?.trim());
    byProvince.set(row.province, inspectors);
  }

  return getDeployedMapProvinces().map((province) => ({
    province,
    inspectors: byProvince.get(province) ?? [],
  }));
}
