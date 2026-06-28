const FALLBACK_ALT = "Média IGM";

/** Texte alternatif lisible à partir du nom de fichier (sans extension). */
export function defaultAltFromFilename(filename: string): string {
  const base = filename.replace(/\.[^.]+$/, "").trim();
  if (!base) return FALLBACK_ALT;

  const readable = base
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return readable || FALLBACK_ALT;
}

export function resolveMediaAlt(
  alt: string | null | undefined,
  filename: string | null | undefined,
): string {
  const trimmed = alt?.trim();
  if (trimmed) return trimmed;
  if (filename?.trim()) return defaultAltFromFilename(filename);
  return FALLBACK_ALT;
}
