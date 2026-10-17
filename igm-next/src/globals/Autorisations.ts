import type { GlobalConfig } from "payload";

import { adminHidden, can } from "../access/can";
import { normalizeGrants } from "../access/permissions";
import { writeGrantsCache } from "../access/permissionStore";

export const Autorisations: GlobalConfig = {
  slug: "autorisations",
  label: "Autorisations",
  admin: {
    group: "Administration",
    hidden: adminHidden("autorisations"),
    description:
      "Cochez les droits de chaque rôle. Le Super Admin conserve toujours l’ensemble des droits. Enregistrez pour appliquer.",
  },
  access: {
    read: can("autorisations"),
    update: can("autorisations"),
  },
  hooks: {
    beforeChange: [
      ({ data }) => ({
        ...data,
        grants: normalizeGrants(data?.grants),
      }),
    ],
    afterChange: [
      ({ doc }) => {
        writeGrantsCache(normalizeGrants(doc?.grants));
      },
    ],
  },
  fields: [
    {
      name: "grants",
      type: "json",
      label: "Droits par rôle",
      admin: {
        components: {
          Field: "@/components/admin/RolePermissionsMatrix#RolePermissionsMatrix",
        },
      },
    },
  ],
};
