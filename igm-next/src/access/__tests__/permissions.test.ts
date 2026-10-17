import { describe, expect, it } from "vitest";

import {
  defaultGrants,
  normalizeGrants,
  roleForNav,
  roleHasPermission,
  ROLES,
} from "../permissions";

describe("normalizeGrants", () => {
  it("starts from the default matrix", () => {
    const grants = defaultGrants();
    expect(grants.signalements.signalements).toBe(true);
    expect(grants.signalements.pages).toBe(false);
    expect(grants.publication.news).toBe(true);
    expect(grants.publication.users).toBe(false);
    expect(grants.publication.siteSettings).toBe(false);
    expect(grants.technique.siteSettings).toBe(true);
    expect(grants.technique.media).toBe(true);
    expect(grants.technique.users).toBe(false);
    expect(grants.technique.news).toBe(false);
  });

  it("keeps explicit booleans and fills the rest with defaults", () => {
    const grants = normalizeGrants({
      publication: { users: true, news: false },
      signalements: { contactMessages: true },
    });
    expect(grants.publication.users).toBe(true);
    expect(grants.publication.news).toBe(false);
    expect(grants.publication.pages).toBe(true);
    expect(grants.signalements.contactMessages).toBe(true);
    expect(grants.signalements.signalements).toBe(true);
  });

  it("ignores unknown values", () => {
    expect(normalizeGrants(null)).toEqual(defaultGrants());
    expect(normalizeGrants({ publication: { news: "yes" } }).publication.news).toBe(true);
  });
});

describe("roleHasPermission", () => {
  const grants = normalizeGrants({
    signalements: { signalements: false, contactMessages: true },
  });

  it("gives every permission to the super admin", () => {
    expect(roleHasPermission(ROLES.superAdmin, "users", grants)).toBe(true);
    expect(roleHasPermission(ROLES.superAdmin, "signalements", grants)).toBe(true);
  });

  it("reads the stored checkbox for the other roles", () => {
    expect(roleHasPermission(ROLES.signalements, "signalements", grants)).toBe(false);
    expect(roleHasPermission(ROLES.signalements, "contactMessages", grants)).toBe(true);
    expect(roleHasPermission(null, "news", grants)).toBe(false);
  });
});

describe("roleForNav", () => {
  it("treats a legacy session without a role as super admin", () => {
    expect(roleForNav({ id: 1, email: "a@igm.cd" })).toBe(ROLES.superAdmin);
  });

  it("uses the role stored on the session", () => {
    expect(roleForNav({ id: 2, role: ROLES.publication })).toBe(ROLES.publication);
  });
});
