"use client";

import { toast, useAuth, useConfig, useListQuery } from "@payloadcms/ui";
import type { DefaultCellComponentProps } from "payload";
import { useState, type ReactNode } from "react";

import "./user-row-actions.css";

type UserRow = {
  id?: number | string;
  email?: string | null;
  blocked?: boolean | null;
};

function ActionIcon({ children }: { children: ReactNode }) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="15"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
      width="15"
    >
      {children}
    </svg>
  );
}

async function readError(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as {
      message?: string;
      errors?: { message?: string }[];
    };
    return body.errors?.[0]?.message || body.message || "Action impossible.";
  } catch {
    return "Action impossible.";
  }
}

export function UserRowActionsField() {
  return null;
}

export function UserBlockedCell({ rowData }: DefaultCellComponentProps) {
  const blocked = Boolean((rowData as UserRow).blocked);
  return (
    <span
      className={
        blocked
          ? "user-row-actions__status user-row-actions__status--blocked"
          : "user-row-actions__status"
      }
    >
      {blocked ? "Bloqué" : "Actif"}
    </span>
  );
}

export function UserRowActionsCell({ rowData }: DefaultCellComponentProps) {
  const doc = rowData as UserRow;
  const { user } = useAuth();
  const { config } = useConfig();
  const { query, refineListData } = useListQuery();
  const [pending, setPending] = useState<"block" | "delete" | null>(null);

  const id = doc.id;
  const isSelf = user?.id != null && String(user.id) === String(id);
  const blocked = Boolean(doc.blocked);
  const adminRoute = config.routes?.admin || "/admin";
  const apiRoute = config.routes?.api || "/api";
  const editHref = `${adminRoute}/collections/users/${id}`;

  const refresh = async () => {
    await refineListData(query);
  };

  const toggleBlocked = async () => {
    if (id == null || isSelf || pending) return;
    const nextBlocked = !blocked;
    const confirmed = window.confirm(
      nextBlocked
        ? `Bloquer ${doc.email || "ce compte"} ? La personne ne pourra plus se connecter.`
        : `Débloquer ${doc.email || "ce compte"} ?`,
    );
    if (!confirmed) return;

    setPending("block");
    try {
      const response = await fetch(`${apiRoute}/users/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blocked: nextBlocked }),
      });
      if (!response.ok) {
        toast.error(await readError(response));
        return;
      }
      toast.success(nextBlocked ? "Compte bloqué." : "Compte débloqué.");
      await refresh();
    } catch {
      toast.error("Action impossible.");
    } finally {
      setPending(null);
    }
  };

  const removeUser = async () => {
    if (id == null || isSelf || pending) return;
    const confirmed = window.confirm(
      `Supprimer définitivement ${doc.email || "ce compte"} ? Cette action est irréversible.`,
    );
    if (!confirmed) return;

    setPending("delete");
    try {
      const response = await fetch(`${apiRoute}/users/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) {
        toast.error(await readError(response));
        return;
      }
      toast.success("Compte supprimé.");
      await refresh();
    } catch {
      toast.error("Action impossible.");
    } finally {
      setPending(null);
    }
  };

  const blockLabel = blocked ? "Débloquer" : "Bloquer";

  return (
    <div className="user-row-actions" onClick={(event) => event.stopPropagation()}>
      <a className="user-row-actions__btn" href={editHref} title="Modifier" aria-label="Modifier">
        <ActionIcon>
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
        </ActionIcon>
      </a>
      <button
        type="button"
        className={
          blocked
            ? "user-row-actions__btn user-row-actions__btn--unblock"
            : "user-row-actions__btn user-row-actions__btn--block"
        }
        disabled={isSelf || pending != null}
        title={isSelf ? "Vous ne pouvez pas bloquer votre propre compte" : blockLabel}
        aria-label={blockLabel}
        onClick={toggleBlocked}
      >
        <ActionIcon>
          <rect height="11" rx="2" width="18" x="3" y="11" />
          {blocked ? (
            <path d="M7 11V7a5 5 0 0 1 9.9-1" />
          ) : (
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          )}
        </ActionIcon>
      </button>
      <button
        type="button"
        className="user-row-actions__btn user-row-actions__btn--danger"
        disabled={isSelf || pending != null}
        title={isSelf ? "Vous ne pouvez pas supprimer votre propre compte" : "Supprimer"}
        aria-label="Supprimer"
        onClick={removeUser}
      >
        <ActionIcon>
          <path d="M3 6h18" />
          <path d="M8 6V4h8v2" />
          <path d="M19 6l-1 14H6L5 6" />
          <path d="M10 11v6" />
          <path d="M14 11v6" />
        </ActionIcon>
      </button>
    </div>
  );
}
