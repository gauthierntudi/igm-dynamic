/**
 * Schéma home.actionSection.
 * Usage: npm run db:sync-home-action
 */
import pg from "pg";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const sqlPath = join(__dirname, "db-sync-home-action.sql");

const connectionString = process.env.DATABASE_URI || process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URI manquant.");
  process.exit(1);
}

const pool = new pg.Pool({ connectionString });

try {
  console.log("→ Migration home.actionSection…");
  const sql = readFileSync(sqlPath, "utf8");
  await pool.query(sql);
  console.log("Migration home.actionSection terminée.");
} catch (err) {
  console.error(err);
  process.exitCode = 1;
} finally {
  await pool.end();
}
