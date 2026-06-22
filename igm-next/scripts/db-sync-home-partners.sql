-- Section partenaires (home.partnersSection)
ALTER TABLE "home_locales" ADD COLUMN IF NOT EXISTS "partners_section_title" varchar;

CREATE TABLE IF NOT EXISTS "home_partners_section_partners" (
  "_order" integer NOT NULL,
  "_parent_id" integer NOT NULL,
  "id" varchar PRIMARY KEY NOT NULL,
  "logo_id" integer,
  "logo_dark_id" integer,
  "url" varchar
);
CREATE INDEX IF NOT EXISTS "home_partners_section_partners_order_idx"
  ON "home_partners_section_partners" ("_order");
CREATE INDEX IF NOT EXISTS "home_partners_section_partners_parent_id_idx"
  ON "home_partners_section_partners" ("_parent_id");
DO $$ BEGIN
  ALTER TABLE "home_partners_section_partners"
    ADD CONSTRAINT "home_partners_section_partners_parent_id_fk"
    FOREIGN KEY ("_parent_id") REFERENCES "home"("id") ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "home_partners_section_partners"
    ADD CONSTRAINT "home_partners_section_partners_logo_id_media_id_fk"
    FOREIGN KEY ("logo_id") REFERENCES "media"("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "home_partners_section_partners"
    ADD CONSTRAINT "home_partners_section_partners_logo_dark_id_media_id_fk"
    FOREIGN KEY ("logo_dark_id") REFERENCES "media"("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE INDEX IF NOT EXISTS "home_partners_section_partners_logo_idx"
  ON "home_partners_section_partners" ("logo_id");
CREATE INDEX IF NOT EXISTS "home_partners_section_partners_logo_dark_idx"
  ON "home_partners_section_partners" ("logo_dark_id");

CREATE TABLE IF NOT EXISTS "home_partners_section_partners_locales" (
  "name" varchar NOT NULL,
  "id" serial PRIMARY KEY NOT NULL,
  "_locale" "_locales" NOT NULL,
  "_parent_id" varchar NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "home_partners_section_partners_locales_locale_parent_id_unique"
  ON "home_partners_section_partners_locales" ("_locale", "_parent_id");
DO $$ BEGIN
  ALTER TABLE "home_partners_section_partners_locales"
    ADD CONSTRAINT "home_partners_section_partners_locales_parent_id_fk"
    FOREIGN KEY ("_parent_id") REFERENCES "home_partners_section_partners"("id") ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
