/**
 * Utilitaires partagés pour les scripts db:sync-*.
 * Schéma uniquement — le contenu éditorial passe par les scripts seed:* (manuel).
 */
import { readFileSync } from "node:fs";
import pg from "pg";

const LEGACY_SSL_MODES = new Set(["prefer", "require", "verify-ca"]);

function normalizePostgresConnectionString(uri) {
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

/** Neon : préfère l'hôte pooler (meilleure reachabilité depuis un poste dev). */
function preferNeonPoolerConnectionString(uri) {
  try {
    const url = new URL(uri);
    const host = url.hostname;
    if (host.includes(".neon.tech") && !host.includes("-pooler")) {
      url.hostname = host.replace(/^(ep-[^.]+)\./, "$1-pooler.");
    }
    return url.toString();
  } catch {
    return uri;
  }
}

export function resolveMigrationDatabaseUri() {
  const raw = process.env.DATABASE_URI || process.env.DATABASE_URL || "";
  if (!raw.trim()) return "";

  const normalized = normalizePostgresConnectionString(raw);
  return preferNeonPoolerConnectionString(normalized);
}

export function createMigrationPool() {
  const connectionString = resolveMigrationDatabaseUri();
  if (!connectionString) {
    throw new Error("DATABASE_URI ou DATABASE_URL manquant dans l'environnement.");
  }

  let host = "";
  try {
    host = new URL(connectionString).hostname;
  } catch {
    // ignore
  }

  if (host && !host.includes("-pooler") && host.includes(".neon.tech")) {
    console.warn(
      "⚠ Connexion Neon sans pooler détectée — bascule automatique vers l'hôte -pooler pour la migration.",
    );
  }

  return new pg.Pool({
    connectionString,
    connectionTimeoutMillis: 20_000,
    // Évite les échecs EHOSTUNREACH IPv6 sur certains réseaux locaux.
    family: 4,
  });
}

export async function columnExists(pool, table, column) {
  const { rows } = await pool.query(
    `SELECT 1
     FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = $1 AND column_name = $2`,
    [table, column],
  );
  return rows.length > 0;
}

export async function runSqlFile(pool, sqlPath) {
  const sql = readFileSync(sqlPath, "utf8");
  await pool.query(sql);
}

/**
 * Crée une ligne vide pour un global Payload (singleton), sans contenu éditorial.
 * N'insère que si la table est totalement vide — jamais de réinitialisation.
 */
export async function ensureGlobalShellRow(pool, table) {
  const { rows } = await pool.query(`SELECT id FROM "${table}" LIMIT 1`);
  if (rows.length) {
    console.log(`OK: ${table} (ligne existante id=${rows[0].id})`);
    return rows[0].id;
  }

  const { rows: inserted } = await pool.query(
    `INSERT INTO "${table}" (created_at, updated_at) VALUES (NOW(), NOW()) RETURNING id`,
  );
  const id = inserted[0].id;
  console.log(`→ ${table} : ligne vide créée (id=${id}) — utilisez seed:* pour le contenu`);
  return id;
}
