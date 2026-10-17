import { APIError, type CollectionBeforeChangeHook, type CollectionBeforeDeleteHook } from "payload";

import { actorCan } from "../access/can";
import { resolveRole } from "../access/permissionStore";
import { ROLES, type Role } from "../access/permissions";

async function superAdminCount(req: Parameters<CollectionBeforeChangeHook>[0]["req"]): Promise<number> {
  const { totalDocs } = await req.payload.count({
    collection: "users",
    overrideAccess: true,
    where: { role: { equals: ROLES.superAdmin } },
    req,
  });
  return totalDocs;
}

function asRole(value: unknown): Role | null {
  if (value === ROLES.superAdmin || value === ROLES.signalements || value === ROLES.publication) {
    return value;
  }
  return null;
}

/** Premier compte = Super Admin. Empêche de retirer le dernier Super Admin ou de s'auto-promouvoir. */
export const protectUserRoles: CollectionBeforeChangeHook = async ({
  data,
  originalDoc,
  operation,
  req,
}) => {
  const next = { ...data };

  if (operation === "update" && originalDoc && (next.role == null || next.role === "")) {
    next.role = originalDoc.role;
  }

  if (operation === "create") {
    const { totalDocs } = await req.payload.count({
      collection: "users",
      overrideAccess: true,
      req,
    });
    if (totalDocs === 0) {
      next.role = ROLES.superAdmin;
      return next;
    }
  }

  const actorRole = await resolveRole(req);
  const canManageUsers = Boolean(req.user) && (await actorCan(req, "users"));

  if (req.user && !canManageUsers) {
    next.role = originalDoc?.role ?? next.role;
  }

  if (actorRole && actorRole !== ROLES.superAdmin) {
    if (next.role === ROLES.superAdmin) {
      next.role = originalDoc?.role ?? ROLES.publication;
    }
    if (originalDoc?.role === ROLES.superAdmin) {
      next.role = ROLES.superAdmin;
    }
  }

  const previous = asRole(originalDoc?.role);
  const upcoming = asRole(next.role);
  if (operation === "update" && previous === ROLES.superAdmin && upcoming !== ROLES.superAdmin) {
    const remaining = await superAdminCount(req);
    if (remaining <= 1) {
      throw new APIError("Le dernier Super Admin ne peut pas changer de rôle.", 400);
    }
  }

  return next;
};

export const protectLastSuperAdminDelete: CollectionBeforeDeleteHook = async ({ req, id }) => {
  const doc = await req.payload.findByID({
    collection: "users",
    id,
    depth: 0,
    overrideAccess: true,
    req,
  });

  if (doc?.role !== ROLES.superAdmin) return;

  const actorRole = await resolveRole(req);
  if (actorRole !== ROLES.superAdmin) {
    throw new APIError("Seul un Super Admin peut supprimer un Super Admin.", 403);
  }

  const remaining = await superAdminCount(req);
  if (remaining <= 1) {
    throw new APIError("Le dernier Super Admin ne peut pas être supprimé.", 400);
  }
};
