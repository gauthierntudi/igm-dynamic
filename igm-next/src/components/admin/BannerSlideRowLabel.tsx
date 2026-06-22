"use client";

import { useRowLabel } from "@payloadcms/ui";
import React from "react";

type BannerSlideRow = {
  adminLabel?: string | null;
  title?: string | null;
};

export function BannerSlideRowLabel() {
  const { data, rowNumber } = useRowLabel<BannerSlideRow>();

  const adminLabel = data?.adminLabel?.trim();
  if (adminLabel) {
    return <span className="row-label">{adminLabel}</span>;
  }

  const title = data?.title?.trim();
  if (title) {
    return <span className="row-label">{title}</span>;
  }

  const index = (rowNumber ?? 0) + 1;
  return (
    <span className="row-label">{`Diapositive ${String(index).padStart(2, "0")}`}</span>
  );
}
