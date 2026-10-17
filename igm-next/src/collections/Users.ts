import type { Access, CollectionConfig } from "payload";

import { actorCan, adminHidden } from "../access/can";
import { ROLES, ROLE_OPTIONS } from "../access/permissions";
import { protectLastSuperAdminDelete, protectUserRoles } from "../hooks/protectUserRoles";

const readOrUpdateOwn: Access = async ({ req }) => {
  if (!req.user) return false;
  if (await actorCan(req, "users")) return true;
  return { id: { equals: req.user.id } };
};

export const Users: CollectionConfig = {
  slug: "users",
  labels: {
    singular: "Utilisateur",
    plural: "Utilisateurs",
  },
  admin: {
    useAsTitle: "email",
    defaultColumns: ["email", "role", "updatedAt"],
    group: "Administration",
    hidden: adminHidden("users"),
    description: "Comptes de l’admin. Le rôle détermine les droits, ajustables dans Autorisations.",
  },
  auth: true,
  access: {
    read: readOrUpdateOwn,
    create: async ({ req }) => actorCan(req, "users"),
    update: readOrUpdateOwn,
    delete: async ({ req }) => actorCan(req, "users"),
  },
  hooks: {
    beforeChange: [protectUserRoles],
    beforeDelete: [protectLastSuperAdminDelete],
  },
  fields: [
    {
      name: "role",
      type: "select",
      label: "Rôle",
      required: true,
      defaultValue: ROLES.publication,
      saveToJWT: true,
      options: ROLE_OPTIONS,
      access: {
        update: async ({ req }) => {
          if (!req.user) return true;
          return actorCan(req, "users");
        },
      },
      admin: {
        position: "sidebar",
        condition: (_data, _sibling, { user }) => Boolean(user),
        description: "Super Admin a tous les droits. Les deux autres rôles suivent la page Autorisations.",
      },
    },
  ],
};
