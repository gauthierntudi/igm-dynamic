"use client";

import { useRowLabel } from "@payloadcms/ui";
import React from "react";

type NavRow = {
  label?: string | Record<string, string | null | undefined> | null;
  itemType?: string | null;
};

const TYPE_LABELS: Record<string, string> = {
  link: "Lien",
  dropdown: "Menu",
  report: "Dénoncer",
};

function labelFromRow(label: NavRow["label"]): string | null {
  if (typeof label === "string") {
    const trimmed = label.trim();
    return trimmed || null;
  }
  if (label && typeof label === "object") {
    for (const value of Object.values(label)) {
      if (typeof value === "string" && value.trim()) return value.trim();
    }
  }
  return null;
}

export function NavMenuRowLabel() {
  const { data, rowNumber } = useRowLabel<NavRow>();

  const label = labelFromRow(data?.label);
  if (label) {
    return <span className="row-label">{label}</span>;
  }

  const type = data?.itemType ? TYPE_LABELS[data.itemType] ?? data.itemType : "Élément";
  const index = (rowNumber ?? 0) + 1;
  return <span className="row-label">{`${type} ${String(index).padStart(2, "0")}`}</span>;
}
