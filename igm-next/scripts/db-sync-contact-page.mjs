/**
 * Schéma global contact-page (page Contact).
 * Usage: npm run db:sync-contact-page
 */
import pg from "pg";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { ensureGlobalShellRow, runSqlFile } from "./lib/db-migration.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const sqlPath = join(__dirname, "db-sync-contact-page.sql");

const connectionString = process.env.DATABASE_URI || process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URI manquant.");
  process.exit(1);
}

const pool = new pg.Pool({ connectionString });

try {
  console.log("→ Migration contact-page (schéma)…");
  await runSqlFile(pool, sqlPath);
  await ensureGlobalShellRow(pool, "contact_page");
  console.log("Migration contact-page terminée.");
} catch (err) {
  console.error(err);
  process.exitCode = 1;
} finally {
  await pool.end();
}
