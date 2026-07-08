import type { GlobalAfterReadHook, GlobalBeforeChangeHook } from "payload";

import { mergeDeployedProvinceAssignments } from "@/lib/cartography/provinceAssignments";
import type { CmsCartographySettings } from "@/lib/cms/cartography/types";

export const ensureCartographyProvincesAfterRead: GlobalAfterReadHook = ({ doc }) => {
  const settings = doc as CmsCartographySettings;
  return {
    ...settings,
    provinceAssignments: mergeDeployedProvinceAssignments(settings.provinceAssignments),
  };
};

export const ensureCartographyProvincesBeforeChange: GlobalBeforeChangeHook = ({ data }) => {
  const settings = data as CmsCartographySettings;
  return {
    ...settings,
    provinceAssignments: mergeDeployedProvinceAssignments(settings.provinceAssignments),
  };
};
