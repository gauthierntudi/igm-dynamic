/**
 * Schéma global page-heroes (bannières Présentation, LCFCM, Contact, Médiathèque).
 * Usage: npm run db:sync-page-heroes
 */
import pg from "pg";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { ensureGlobalShellRow, runSqlFile } from "./lib/db-migration.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const sqlPath = join(__dirname, "db-sync-page-heroes.sql");

const connectionString = process.env.DATABASE_URI || process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URI manquant.");
  process.exit(1);
}

const pool = new pg.Pool({ connectionString });

try {
  console.log("→ Migration page-heroes (schéma)…");
  await runSqlFile(pool, sqlPath);
  await ensureGlobalShellRow(pool, "page_heroes");
  console.log("Migration page-heroes terminée.");
} catch (err) {
  console.error(err);
  process.exitCode = 1;
} finally {
  await pool.end();
}
