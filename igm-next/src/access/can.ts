import type { Access, PayloadRequest } from "payload";

import { readGrantsSync, userHasPermission } from "./permissionStore";
import { roleForNav, roleHasPermission, type PermissionKey } from "./permissions";

export const can =
  (permission: PermissionKey): Access =>
  async ({ req }) =>
    userHasPermission(req, permission);

/** Brouillons visibles seulement pour le rôle autorisé ; le public ne voit que le publié. */
export const publishedRead =
  (permission: PermissionKey): Access =>
  async ({ req }) => {
    if (await userHasPermission(req, permission)) return true;
    return {
      _status: {
        equals: "published",
      },
    };
  };

export function publishedAccess(permission: PermissionKey): {
  read: Access;
  create: Access;
  update: Access;
  delete: Access;
} {
  const allow = can(permission);
  return {
    read: publishedRead(permission),
    create: allow,
    update: allow,
    delete: allow,
  };
}

export function staffAccess(permission: PermissionKey): {
  read: Access;
  create: Access;
  update: Access;
  delete: Access;
} {
  const allow = can(permission);
  return {
    read: allow,
    create: allow,
    update: allow,
    delete: allow,
  };
}

export function globalAccess(permission: PermissionKey): { read: Access; update: Access } {
  return {
    read: () => true,
    update: can(permission),
  };
}

export function adminHidden(permission: PermissionKey): (args: { user: unknown }) => boolean {
  return ({ user }) => !roleHasPermission(roleForNav(user), permission, readGrantsSync());
}

export async function actorCan(req: PayloadRequest, permission: PermissionKey): Promise<boolean> {
  return userHasPermission(req, permission);
}
