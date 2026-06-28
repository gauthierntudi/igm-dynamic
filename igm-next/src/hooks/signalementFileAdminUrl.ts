import type { CollectionAfterReadHook } from "payload";

function signalementFileStreamUrl(
  apiRoute: string,
  filename: string,
  prefix?: string | null,
): string {
  const qs =
    typeof prefix === "string" && prefix
      ? `?prefix=${encodeURIComponent(prefix)}`
      : "";
  return `${apiRoute}/signalement-files/file/${encodeURIComponent(filename)}${qs}`;
}

/** URLs same-origin en admin pour prévisualiser les pièces jointes (S3 privé / local). */
export const signalementFileAdminUrl: CollectionAfterReadHook = ({ doc, req }) => {
  if (!req?.user || !doc?.filename || typeof doc.filename !== "string") {
    return doc;
  }

  const apiRoute = req.payload.config.routes?.api || "/api";
  const prefix = typeof doc.prefix === "string" ? doc.prefix : null;

  return {
    ...doc,
    url: signalementFileStreamUrl(apiRoute, doc.filename, prefix),
  };
};
