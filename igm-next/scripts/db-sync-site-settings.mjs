/**
 * Applique le schéma site_settings (menu header + footer) sans prompt Drizzle.
 * Usage: node --env-file=.env.local scripts/db-sync-site-settings.mjs
 */
import pg from "pg";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const sqlPath = join(__dirname, "db-sync-site-settings.sql");

const connectionString = process.env.DATABASE_URI || process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URI manquant.");
  process.exit(1);
}

const pool = new pg.Pool({ connectionString });

async function columnExists(table, column) {
  const { rows } = await pool.query(
    `SELECT 1 FROM information_schema.columns WHERE table_name = $1 AND column_name = $2`,
    [table, column],
  );
  return rows.length > 0;
}

async function addColumn(table, column, definition) {
  if (await columnExists(table, column)) {
    console.log(`OK: ${table}.${column}`);
    return;
  }
  await pool.query(`ALTER TABLE "${table}" ADD COLUMN "${column}" ${definition}`);
  console.log(`Added ${table}.${column}`);
}

try {
  console.log("→ Colonnes site_settings…");
  await addColumn("site_settings", "footer_contact_phone", "varchar DEFAULT '+243 900 030 005'");
  await addColumn("site_settings", "footer_contact_email", "varchar");

  console.log("→ Colonnes site_settings_locales…");
  await addColumn("site_settings_locales", "footer_hq_heading", "varchar DEFAULT 'Adresse du siège'");
  await addColumn("site_settings_locales", "footer_hq_text", "varchar");
  await addColumn("site_settings_locales", "footer_contact_title", "varchar DEFAULT 'Contact'");
  await addColumn("site_settings_locales", "footer_contact_lead", "varchar");
  await addColumn("site_settings_locales", "footer_social_title", "varchar DEFAULT 'Réseaux sociaux'");
  await addColumn("site_settings_locales", "footer_copyright", "varchar");

  console.log("→ Enums + tables (script SQL)…");
  const sql = readFileSync(sqlPath, "utf8");
  await pool.query(sql);

  console.log("→ Ligne initiale site_settings…");
  const { rows: existing } = await pool.query(`SELECT id FROM site_settings LIMIT 1`);
  if (!existing.length) {
    const { rows: inserted } = await pool.query(
      `INSERT INTO site_settings (phone_vert, email, created_at, updated_at)
       VALUES ('+243 97 684 4563', 'info@igm.cd', NOW(), NOW())
       RETURNING id`,
    );
    const id = inserted[0].id;
    await pool.query(
      `INSERT INTO site_settings_locales (site_name, _locale, _parent_id)
       VALUES ('IGM', 'fr', $1), ('IGM', 'en', $1)
       ON CONFLICT DO NOTHING`,
      [id],
    );
    console.log(`Created site_settings id=${id}`);
  } else {
    console.log(`OK: site_settings id=${existing[0].id}`);
  }

  console.log("Migration site_settings terminée.");
} catch (err) {
  console.error(err);
  process.exitCode = 1;
} finally {
  await pool.end();
}
