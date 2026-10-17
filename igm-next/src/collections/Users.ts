import { APIError, type Access, type CollectionConfig } from "payload";

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
    defaultColumns: ["name", "email", "role", "blocked", "updatedAt", "rowActions"],
    listSearchableFields: ["name", "email"],
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
    beforeLogin: [
      ({ user }) => {
        if (user?.blocked) {
          throw new APIError("Ce compte est bloqué. Contactez un Super Admin.", 401);
        }
        return user;
      },
    ],
    beforeChange: [protectUserRoles],
    beforeDelete: [protectLastSuperAdminDelete],
  },
  fields: [
    {
      name: "name",
      type: "text",
      label: "Nom",
    },
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
        description: "Super Admin a tous les droits. Les autres rôles suivent la page Autorisations.",
      },
    },
    {
      name: "blocked",
      type: "checkbox",
      label: "Compte bloqué",
      defaultValue: false,
      access: {
        update: async ({ req }) => {
          if (!req.user) return true;
          return actorCan(req, "users");
        },
      },
      admin: {
        position: "sidebar",
        description: "Un compte bloqué ne peut plus se connecter à l’admin.",
        components: {
          Cell: "@/components/admin/UserRowActionsCell#UserBlockedCell",
        },
      },
    },
    {
      name: "rowActions",
      type: "ui",
      label: "Actions",
      admin: {
        components: {
          Field: "@/components/admin/UserRowActionsCell#UserRowActionsField",
          Cell: "@/components/admin/UserRowActionsCell#UserRowActionsCell",
        },
      },
    },
  ],
};
