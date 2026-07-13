/**
 * Schéma Payload : globals legislation + page-heroes + contact-page + cartography-settings.
 * Usage: npm run db:sync-globals
 *
 * Schéma uniquement — pas de seed de contenu.
 */
import pg from "pg";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { ensureGlobalShellRow, runSqlFile } from "./lib/db-migration.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));

const connectionString = process.env.DATABASE_URI || process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URI manquant.");
  process.exit(1);
}

const pool = new pg.Pool({ connectionString });

const migrations = [
  { file: "db-sync-legislation.sql", table: "legislation" },
  { file: "db-sync-page-heroes.sql", table: "page_heroes" },
  { file: "db-sync-page-images.sql", table: null },
  { file: "db-sync-contact-page.sql", table: "contact_page" },
  { file: "db-sync-press-kit-page.sql", table: "press_kit_page" },
  { file: "db-sync-cartography-settings.sql", table: "cartography_settings" },
];

try {
  for (const { file, table } of migrations) {
    console.log(`→ Migration ${file}…`);
    await runSqlFile(pool, join(__dirname, file));
    if (table) {
      await ensureGlobalShellRow(pool, table);
    }
  }
  console.log("Migration globals terminée.");
} catch (err) {
  console.error(err);
  process.exitCode = 1;
} finally {
  await pool.end();
}
