"use client";

import { UploadField, useField, useForm } from "@payloadcms/ui";
import type { UploadFieldClientComponent } from "payload";
import { useEffect, useRef } from "react";

const PHOTOS_PATH = "photos";

function mediaId(value: unknown): number | string | null {
  if (value == null) return null;
  if (typeof value === "object" && "id" in value) {
    const id = (value as { id: unknown }).id;
    if (typeof id === "number" || typeof id === "string") return id;
    return null;
  }
  if (typeof value === "number" || typeof value === "string") return value;
  return null;
}

function normalizeIds(value: unknown): Array<number | string> {
  const raw = Array.isArray(value) ? value : value != null ? [value] : [];
  return raw
    .map((item) => mediaId(item))
    .filter((id): id is number | string => id != null);
}

/**
 * Champ admin « Ajouter plusieurs photos » : sélection / upload multiple
 * qui alimente automatiquement le tableau `photos` (image + légende).
 */
export const BulkAddAlbumPhotosField: UploadFieldClientComponent = (props) => {
  const { path } = props;
  const { value, setValue } = useField<unknown>({ path });
  const { addFieldRow, dispatchFields, getDataByPath, setModified } = useForm();
  const lastMergedKey = useRef("");

  useEffect(() => {
    const ids = normalizeIds(value);
    const key = ids.join(",");
    if (!ids.length || key === lastMergedKey.current) return;
    lastMergedKey.current = key;

    const existing =
      (getDataByPath(PHOTOS_PATH) as Array<{ image?: unknown }> | undefined) ??
      [];
    const existingIds = new Set(
      existing
        .map((row) => mediaId(row?.image))
        .filter((id): id is number | string => id != null),
    );

    const toAdd = ids.filter((id) => !existingIds.has(id));
    if (!toAdd.length) {
      setValue(null);
      lastMergedKey.current = "";
      return;
    }

    const emptyRowIndexes = existing
      .map((row, index) => (mediaId(row?.image) == null ? index : -1))
      .filter((index) => index >= 0);

    // rowIndex explicite : getDataByPath n’est pas à jour entre dispatches synchrone.
    let nextRowIndex = existing.length;

    for (const id of toAdd) {
      const emptyIndex = emptyRowIndexes.shift();
      if (typeof emptyIndex === "number") {
        dispatchFields({
          type: "UPDATE",
          path: `${PHOTOS_PATH}.${emptyIndex}.image`,
          value: id,
        });
        continue;
      }

      addFieldRow({
        path: PHOTOS_PATH,
        rowIndex: nextRowIndex,
        schemaPath: PHOTOS_PATH,
        subFieldState: {
          image: {
            initialValue: id,
            valid: true,
            value: id,
          },
          caption: {
            initialValue: null,
            valid: true,
            value: null,
          },
        },
      });
      nextRowIndex += 1;
    }

    setModified(true);
    setValue(null);
    lastMergedKey.current = "";
  }, [addFieldRow, dispatchFields, getDataByPath, setModified, setValue, value]);

  return <UploadField {...props} />;
};
