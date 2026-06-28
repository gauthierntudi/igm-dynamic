import type { CollectionBeforeChangeHook, CollectionBeforeValidateHook } from "payload";

import { resolveMediaAlt } from "@/lib/media/defaultAltFromFilename";

function applyDefaultAlt(data: Record<string, unknown> | undefined) {
  if (!data) return data;

  const filename =
    typeof data.filename === "string"
      ? data.filename
      : typeof data.name === "string"
        ? data.name
        : undefined;

  data.alt = resolveMediaAlt(
    typeof data.alt === "string" ? data.alt : undefined,
    filename,
  );

  return data;
}

/** Remplit le texte alternatif avant validation (bulk upload sans alt saisi). */
export const mediaDefaultAltBeforeValidate: CollectionBeforeValidateHook = ({ data }) =>
  applyDefaultAlt(data as Record<string, unknown> | undefined);

/** Filet de sécurité une fois le filename connu. */
export const mediaDefaultAltBeforeChange: CollectionBeforeChangeHook = ({ data }) =>
  applyDefaultAlt(data as Record<string, unknown> | undefined);
