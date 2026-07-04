const LEGACY_SSL_MODES = new Set(["prefer", "require", "verify-ca"]);

/**
 * Normalise sslmode pour pg v9 / pg-connection-string v3 (Neon, Vercel).
 * `require` est traité comme alias de `verify-full` aujourd'hui — on l'explicite.
 */
export function normalizePostgresConnectionString(uri: string): string {
  const trimmed = uri.trim();
  if (!trimmed) return trimmed;

  try {
    const url = new URL(trimmed);
    const sslmode = url.searchParams.get("sslmode")?.toLowerCase();

    if (sslmode && LEGACY_SSL_MODES.has(sslmode)) {
      url.searchParams.set("sslmode", "verify-full");
    }

    return url.toString();
  } catch {
    return trimmed.replace(
      /([?&])sslmode=(prefer|require|verify-ca)(?=&|$)/gi,
      "$1sslmode=verify-full",
    );
  }
}

export function resolveDatabaseUri(): string {
  const raw = process.env.DATABASE_URI || process.env.DATABASE_URL || "";
  return normalizePostgresConnectionString(raw);
}
