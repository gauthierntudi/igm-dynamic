/**
 * Schéma Payload : globals legislation + page-heroes + contact-page + cartography-settings.
 * Usage: npm run db:sync-globals
 */
import pg from "pg";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

const connectionString = process.env.DATABASE_URI || process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URI manquant.");
  process.exit(1);
}

const pool = new pg.Pool({ connectionString });

const migrations = [
  "db-sync-legislation.sql",
  "db-sync-page-heroes.sql",
  "db-sync-page-images.sql",
  "db-sync-contact-page.sql",
  "db-sync-press-kit-page.sql",
  "db-sync-cartography-settings.sql",
];

try {
  for (const file of migrations) {
    console.log(`→ Migration ${file}…`);
    const sql = readFileSync(join(__dirname, file), "utf8");
    await pool.query(sql);
  }
  console.log("Migration globals terminée.");
} catch (err) {
  console.error(err);
  process.exitCode = 1;
} finally {
  await pool.end();
}
