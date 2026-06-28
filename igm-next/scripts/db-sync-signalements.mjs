/**
 * Colonnes signalements (référence + anonymat) sans prompt Drizzle.
 * Usage: node --env-file=.env.local scripts/db-sync-signalements.mjs
 */
import pg from "pg";

const connectionString = process.env.DATABASE_URI || process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URI manquant.");
  process.exit(1);
}

const pool = new pg.Pool({ connectionString });

async function columnExists(table, column) {
  const { rows } = await pool.query(
    `SELECT 1 FROM information_schema.columns WHERE table_name = $1 AND column_name = $2`,
    [table, column],
  );
  return rows.length > 0;
}

async function addColumn(table, column, definition) {
  if (await columnExists(table, column)) {
    console.log(`OK: ${table}.${column}`);
    return;
  }
  await pool.query(`ALTER TABLE "${table}" ADD COLUMN "${column}" ${definition}`);
  console.log(`Added ${table}.${column}`);
}

try {
  console.log("→ Colonnes signalements…");
  await addColumn("signalements", "reference", "varchar");
  await addColumn("signalements", "est_anonyme", "boolean DEFAULT false");

  await pool.query(
    `CREATE UNIQUE INDEX IF NOT EXISTS signalements_reference_idx ON signalements (reference) WHERE reference IS NOT NULL`,
  );
  console.log("OK: signalements_reference_idx");

  console.log("Terminé.");
} catch (error) {
  console.error(error);
  process.exitCode = 1;
} finally {
  await pool.end();
}
