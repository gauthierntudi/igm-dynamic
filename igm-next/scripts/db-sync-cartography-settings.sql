-- Global Payload « cartography-settings » (affectation inspecteurs par province)
CREATE TABLE IF NOT EXISTS "cartography_settings" (
  "id" serial PRIMARY KEY NOT NULL,
  "updated_at" timestamp(3) with time zone,
  "created_at" timestamp(3) with time zone
);

CREATE TABLE IF NOT EXISTS "cartography_settings_province_assignments" (
  "_order" integer NOT NULL,
  "_parent_id" integer NOT NULL,
  "id" varchar PRIMARY KEY NOT NULL,
  "province" varchar NOT NULL,
  "physical_address" varchar,
  "phone" varchar
);

ALTER TABLE "cartography_settings_province_assignments"
  ADD COLUMN IF NOT EXISTS "physical_address" varchar;

ALTER TABLE "cartography_settings_province_assignments"
  ADD COLUMN IF NOT EXISTS "phone" varchar;

CREATE INDEX IF NOT EXISTS "cartography_settings_province_assignments_order_idx"
  ON "cartography_settings_province_assignments" ("_order");
CREATE INDEX IF NOT EXISTS "cartography_settings_province_assignments_parent_id_idx"
  ON "cartography_settings_province_assignments" ("_parent_id");

DO $$ BEGIN
  ALTER TABLE "cartography_settings_province_assignments"
    ADD CONSTRAINT "cartography_settings_province_assignments_parent_id_fk"
    FOREIGN KEY ("_parent_id") REFERENCES "cartography_settings"("id") ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "cartography_settings_province_assignments_inspectors" (
  "_order" integer NOT NULL,
  "_parent_id" varchar NOT NULL,
  "id" varchar PRIMARY KEY NOT NULL,
  "name" varchar NOT NULL,
  "title" varchar,
  "photo_id" integer
);

CREATE INDEX IF NOT EXISTS "cartography_settings_province_assignments_inspectors_order_idx"
  ON "cartography_settings_province_assignments_inspectors" ("_order");
CREATE INDEX IF NOT EXISTS "cartography_settings_province_assignments_inspectors_parent_id_idx"
  ON "cartography_settings_province_assignments_inspectors" ("_parent_id");
CREATE INDEX IF NOT EXISTS "cartography_settings_province_assignments_inspectors_photo_idx"
  ON "cartography_settings_province_assignments_inspectors" ("photo_id");

DO $$ BEGIN
  ALTER TABLE "cartography_settings_province_assignments_inspectors"
    ADD CONSTRAINT "cartography_settings_province_assignments_inspectors_parent_id_fk"
    FOREIGN KEY ("_parent_id") REFERENCES "cartography_settings_province_assignments"("id") ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "cartography_settings_province_assignments_inspectors"
    ADD CONSTRAINT "cartography_settings_province_assignments_inspectors_photo_id_media_id_fk"
    FOREIGN KEY ("photo_id") REFERENCES "media"("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE "cartography_settings_province_assignments_inspectors"
  ADD COLUMN IF NOT EXISTS "title" varchar;

CREATE TABLE IF NOT EXISTS "cartography_settings_province_assignments_inspectors_minerals" (
  "_order" integer NOT NULL,
  "_parent_id" varchar NOT NULL,
  "id" varchar PRIMARY KEY NOT NULL,
  "name" varchar NOT NULL
);

CREATE INDEX IF NOT EXISTS "cartography_settings_province_assignments_inspectors_minerals_order_idx"
  ON "cartography_settings_province_assignments_inspectors_minerals" ("_order");
CREATE INDEX IF NOT EXISTS "cartography_settings_province_assignments_inspectors_minerals_parent_id_idx"
  ON "cartography_settings_province_assignments_inspectors_minerals" ("_parent_id");

DO $$ BEGIN
  ALTER TABLE "cartography_settings_province_assignments_inspectors_minerals"
    ADD CONSTRAINT "cartography_settings_province_assignments_inspectors_minerals_parent_id_fk"
    FOREIGN KEY ("_parent_id") REFERENCES "cartography_settings_province_assignments_inspectors"("id") ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

INSERT INTO "cartography_settings" ("id", "created_at", "updated_at")
SELECT 1, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM "cartography_settings" WHERE "id" = 1);
