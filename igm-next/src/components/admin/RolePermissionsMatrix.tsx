"use client";

import { useField } from "@payloadcms/ui";
import type { JSONFieldClientComponent } from "payload";
import { Fragment, useMemo } from "react";

import {
  CONFIGURABLE_ROLES,
  normalizeGrants,
  PERMISSION_GROUPS,
  ROLE_LABELS,
  ROLES,
  type ConfigurableRole,
  type Grants,
  type PermissionKey,
} from "@/access/permissions";

import "./role-permissions-matrix.css";

function setGrant(grants: Grants, role: ConfigurableRole, key: PermissionKey, checked: boolean): Grants {
  return {
    ...grants,
    [role]: {
      ...grants[role],
      [key]: checked,
    },
  };
}

export const RolePermissionsMatrix: JSONFieldClientComponent = ({ path }) => {
  const { value, setValue } = useField<Grants>({ path });
  const grants = useMemo(() => normalizeGrants(value), [value]);

  const toggle = (role: ConfigurableRole, key: PermissionKey, checked: boolean) => {
    setValue(setGrant(grants, role, key, checked));
  };

  const setRole = (role: ConfigurableRole, checked: boolean) => {
    const next = { ...grants[role] };
    for (const group of PERMISSION_GROUPS) {
      for (const permission of group.permissions) next[permission.key] = checked;
    }
    setValue({ ...grants, [role]: next });
  };

  return (
    <div className="role-permissions">
      <p className="role-permissions__intro">
        Le Super Admin a toutes les autorisations. Cochez ou décochez les droits des autres rôles, puis
        enregistrez.
      </p>

      <div className="role-permissions__scroll">
        <table className="role-permissions__table">
          <thead>
            <tr>
              <th scope="col">Autorisation</th>
              <th scope="col">{ROLE_LABELS[ROLES.superAdmin]}</th>
              {CONFIGURABLE_ROLES.map((role) => (
                <th key={role} scope="col">
                  <span className="role-permissions__role">{ROLE_LABELS[role]}</span>
                  <span className="role-permissions__bulk">
                    <button type="button" onClick={() => setRole(role, true)}>
                      Tout cocher
                    </button>
                    <button type="button" onClick={() => setRole(role, false)}>
                      Tout décocher
                    </button>
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PERMISSION_GROUPS.map((group) => (
              <Fragment key={group.label}>
                <tr className="role-permissions__group">
                  <th colSpan={2 + CONFIGURABLE_ROLES.length} scope="colgroup">
                    {group.label}
                  </th>
                </tr>
                {group.permissions.map((permission) => (
                  <tr key={permission.key}>
                    <th scope="row">
                      <span className="role-permissions__label">{permission.label}</span>
                      <span className="role-permissions__hint">{permission.description}</span>
                    </th>
                    <td>
                      <input type="checkbox" checked disabled aria-label={`${permission.label}, Super Admin`} />
                    </td>
                    {CONFIGURABLE_ROLES.map((role) => {
                      const inputId = `${role}-${permission.key}`;
                      return (
                        <td key={role}>
                          <input
                            id={inputId}
                            type="checkbox"
                            checked={grants[role][permission.key]}
                            aria-label={`${permission.label}, ${ROLE_LABELS[role]}`}
                            onChange={(event) => toggle(role, permission.key, event.target.checked)}
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
