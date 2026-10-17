import type { Payload, PayloadRequest } from "payload";

import {
  getRole,
  normalizeGrants,
  roleHasPermission,
  type Grants,
  type PermissionKey,
  type Role,
} from "./permissions";

const TTL_MS = 5_000;

type CacheSlot = { grants: Grants; at: number };

function slot(): { cache: CacheSlot | null } {
  const root = globalThis as typeof globalThis & {
    __igmPermissionGrants?: { cache: CacheSlot | null };
  };
  if (!root.__igmPermissionGrants) root.__igmPermissionGrants = { cache: null };
  return root.__igmPermissionGrants;
}

export function readGrantsSync(): Grants {
  return slot().cache?.grants ?? normalizeGrants(undefined);
}

export function writeGrantsCache(grants: Grants): void {
  slot().cache = { grants, at: Date.now() };
}

export function clearGrantsCache(): void {
  slot().cache = null;
}

export async function ensureGrants(payload: Payload): Promise<Grants> {
  const current = slot().cache;
  if (current && Date.now() - current.at < TTL_MS) return current.grants;

  try {
    const doc = await payload.findGlobal({
      slug: "autorisations",
      depth: 0,
      overrideAccess: true,
    });
    const grants = normalizeGrants((doc as { grants?: unknown } | null)?.grants);
    writeGrantsCache(grants);
    return grants;
  } catch (error) {
    console.error("[autorisations] lecture impossible, droits par défaut utilisés", error);
    const grants = normalizeGrants(undefined);
    writeGrantsCache(grants);
    return grants;
  }
}

const roleLookup = new Map<string, { role: Role | null; at: number }>();

export function clearRoleLookup(): void {
  roleLookup.clear();
}

/** Rôle effectif : jeton, sinon relecture du compte (sessions antérieures au champ rôle). */
export async function resolveRole(req: PayloadRequest): Promise<Role | null> {
  const user = req.user;
  if (!user) return null;

  const direct = getRole(user);
  if (direct) return direct;

  const id = String(user.id);
  const cached = roleLookup.get(id);
  if (cached && Date.now() - cached.at < TTL_MS) return cached.role;

  try {
    const doc = await req.payload.findByID({
      collection: "users",
      id: user.id,
      depth: 0,
      overrideAccess: true,
      req,
    });
    const role = getRole(doc);
    roleLookup.set(id, { role, at: Date.now() });
    return role;
  } catch {
    return null;
  }
}

export async function userHasPermission(req: PayloadRequest, permission: PermissionKey): Promise<boolean> {
  const role = await resolveRole(req);
  const grants = await ensureGrants(req.payload);
  return roleHasPermission(role, permission, grants);
}
