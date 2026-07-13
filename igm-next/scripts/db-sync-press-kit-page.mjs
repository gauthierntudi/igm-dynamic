/**
 * Schéma global press-kit-page (Dossier de presse).
 * Usage: npm run db:sync-press-kit-page
 */
import pg from "pg";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { ensureGlobalShellRow, runSqlFile } from "./lib/db-migration.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const sqlPath = join(__dirname, "db-sync-press-kit-page.sql");

const connectionString = process.env.DATABASE_URI || process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URI manquant.");
  process.exit(1);
}

const pool = new pg.Pool({ connectionString });

try {
  console.log("→ Migration press-kit-page (schéma)…");
  await runSqlFile(pool, sqlPath);
  await ensureGlobalShellRow(pool, "press_kit_page");
  console.log("Migration press-kit-page terminée.");
} catch (err) {
  console.error(err);
  process.exitCode = 1;
} finally {
  await pool.end();
}
