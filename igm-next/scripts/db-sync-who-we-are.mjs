/**
 * Schéma global who-we-are (page À propos).
 * Usage: npm run db:sync-who-we-are
 *
 * Ne modifie pas le contenu éditorial. Pour initialiser : npm run seed:who-we-are
 */
import pg from "pg";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { ensureGlobalShellRow, runSqlFile } from "./lib/db-migration.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const sqlPath = join(__dirname, "db-sync-who-we-are.sql");

const connectionString = process.env.DATABASE_URI || process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URI manquant.");
  process.exit(1);
}

const pool = new pg.Pool({ connectionString });

try {
  console.log("→ Migration who-we-are (schéma)…");
  await runSqlFile(pool, sqlPath);
  await ensureGlobalShellRow(pool, "who_we_are");
  console.log("Migration who-we-are terminée.");
} catch (err) {
  console.error(err);
  process.exitCode = 1;
} finally {
  await pool.end();
}
