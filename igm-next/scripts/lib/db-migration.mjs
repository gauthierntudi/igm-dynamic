/**
 * Utilitaires partagés pour les scripts db:sync-*.
 * Schéma uniquement — le contenu éditorial passe par les scripts seed:* (manuel).
 */
import { readFileSync } from "node:fs";

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
