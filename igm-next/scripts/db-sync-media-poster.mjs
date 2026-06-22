/**
 * Colonnes sizes.poster sur media (vignettes vidéo admin).
 * Usage: npm run db:sync-media-poster
 */
import pg from "pg";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const sqlPath = join(__dirname, "db-sync-media-poster.sql");

const connectionString = process.env.DATABASE_URI || process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URI manquant.");
  process.exit(1);
}

const pool = new pg.Pool({ connectionString });

try {
  console.log("→ Migration media.sizes.poster…");
  const sql = readFileSync(sqlPath, "utf8");
  await pool.query(sql);
  console.log("Migration media.sizes.poster terminée.");
} catch (err) {
  console.error(err);
  process.exitCode = 1;
} finally {
  await pool.end();
}
