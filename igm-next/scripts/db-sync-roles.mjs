/**
 * Ajoute le rôle des utilisateurs et le global Autorisations.
 * Usage: node --env-file=.env.local scripts/db-sync-roles.mjs
 */
import pg from "pg";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const sqlPath = join(__dirname, "db-sync-roles.sql");

const connectionString = process.env.DATABASE_URI || process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URI manquant.");
  process.exit(1);
}

const pool = new pg.Pool({ connectionString });

try {
  const sql = readFileSync(sqlPath, "utf8");
  await pool.query(sql);
  // Valeur d'enum ajoutée seule : PostgreSQL refuse de l'utiliser dans la même commande.
  await pool.query(`ALTER TYPE "enum_users_role" ADD VALUE IF NOT EXISTS 'technique'`);
  const { rows } = await pool.query(`SELECT id, email, role FROM users ORDER BY id`);
  console.log(`Rôles appliqués (${rows.length} compte(s)).`);
  for (const row of rows) {
    console.log(`- ${row.email}: ${row.role}`);
  }
} catch (error) {
  console.error(error);
  process.exitCode = 1;
} finally {
  await pool.end();
}
