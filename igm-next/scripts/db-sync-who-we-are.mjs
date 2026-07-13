/**
 * Schéma global who-we-are (page À propos).
 * Usage: npm run db:sync-who-we-are
 *
 * Ne modifie pas le contenu éditorial. Pour initialiser : npm run seed:who-we-are
 */
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { createMigrationPool, ensureGlobalShellRow, runSqlFile } from "./lib/db-migration.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const sqlPath = join(__dirname, "db-sync-who-we-are.sql");

let pool;
try {
  pool = createMigrationPool();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}

try {
  console.log("→ Migration who-we-are (schéma)…");
  await runSqlFile(pool, sqlPath);
  await ensureGlobalShellRow(pool, "who_we_are");
  console.log("Migration who-we-are terminée.");
} catch (err) {
  if (err && typeof err === "object" && "code" in err && err.code === "ETIMEDOUT") {
    console.error(
      "Connexion PostgreSQL expirée. Vérifiez DATABASE_URI (URL Neon avec « -pooler ») et votre réseau (port 5432).",
    );
  }
  console.error(err);
  process.exitCode = 1;
} finally {
  await pool.end();
}
