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
  const byProvince = new Map<
    DrcMapProvince,
    Pick<CmsCartographyProvinceAssignment, "inspectors" | "physicalAddress" | "phone">
  >();

  for (const row of existing ?? []) {
    if (!row?.province || !isDrcMapProvince(row.province) || !isProvinceDeployed(row.province)) continue;
    const inspectors = (row.inspectors ?? []).filter((item) => item?.name?.trim());
    byProvince.set(row.province, {
      inspectors,
      physicalAddress: row.physicalAddress?.trim() || null,
      phone: row.phone?.trim() || null,
    });
  }

  return getDeployedMapProvinces().map((province) => {
    const assignment = byProvince.get(province);

    return {
      province,
      inspectors: assignment?.inspectors ?? [],
      physicalAddress: assignment?.physicalAddress ?? null,
      phone: assignment?.phone ?? null,
    };
  });
}
