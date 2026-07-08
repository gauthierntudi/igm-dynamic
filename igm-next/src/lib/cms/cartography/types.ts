import type { DrcMapProvince } from "@/lib/cartography/provinces";

import type { CmsMedia } from "../types";

export type CmsCartographyMineral = {
  name: string;
};

export type CmsCartographyInspector = {
  name: string;
  title?: string | null;
  photo?: CmsMedia | number | null;
  minerals?: CmsCartographyMineral[] | null;
};

export type CmsCartographyProvinceAssignment = {
  province: DrcMapProvince;
  inspectors?: CmsCartographyInspector[] | null;
};

export type CmsCartographySettings = {
  provinceAssignments?: CmsCartographyProvinceAssignment[] | null;
};
