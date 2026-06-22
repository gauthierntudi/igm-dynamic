/**
 * Aligne les colonnes CTA bannière après le passage href → navLink.
 * Usage: node --env-file=.env.local scripts/db-sync-home-cta.mjs
 */
import pg from "pg";

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

async function renameColumn(table, from, to) {
  if (!(await columnExists(table, from))) {
    if (await columnExists(table, to)) {
      console.log(`OK: ${table}.${to} déjà présent`);
      return;
    }
    console.log(`Skip: ${table}.${from} introuvable`);
    return;
  }
  await pool.query(`ALTER TABLE "${table}" RENAME COLUMN "${from}" TO "${to}"`);
  console.log(`Renamed ${table}.${from} → ${to}`);
}

async function addColumn(table, column) {
  if (await columnExists(table, column)) {
    console.log(`OK: ${table}.${column} déjà présent`);
    return;
  }
  await pool.query(`ALTER TABLE "${table}" ADD COLUMN "${column}" varchar`);
  console.log(`Added ${table}.${column}`);
}

try {
  const table = "home_banner_slides";
  await renameColumn(table, "primary_cta_href", "primary_cta_nav_link");
  await renameColumn(table, "secondary_cta_href", "secondary_cta_nav_link");
  await addColumn(table, "primary_cta_custom_href");
  await addColumn(table, "secondary_cta_custom_href");
  console.log("Migration home_banner_slides terminée.");
} catch (err) {
  console.error(err);
  process.exitCode = 1;
} finally {
  await pool.end();
}
