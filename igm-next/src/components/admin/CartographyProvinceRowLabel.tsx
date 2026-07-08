"use client";

import { useRowLabel } from "@payloadcms/ui";

import { getDeployedMapProvinces } from "@/lib/cartography/provinceAssignments";

type RowData = {
  province?: string;
};

const DEPLOYED_PROVINCES = getDeployedMapProvinces();

export function CartographyProvinceRowLabel() {
  const { data, rowNumber } = useRowLabel<RowData>();
  const province =
    data?.province?.trim() ||
    DEPLOYED_PROVINCES[rowNumber ?? 0] ||
    `Province ${String((rowNumber ?? 0) + 1).padStart(2, "0")}`;

  return <span className="row-label">{province}</span>;
}
