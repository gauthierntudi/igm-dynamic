-- Global Payload « press-kit-page » (Dossier de presse)
CREATE TABLE IF NOT EXISTS "press_kit_page" (
  "id" serial PRIMARY KEY NOT NULL,
  "presentation_pdf_id" integer,
  "updated_at" timestamp(3) with time zone,
  "created_at" timestamp(3) with time zone
);

DO $$ BEGIN
  ALTER TABLE "press_kit_page" ADD COLUMN IF NOT EXISTS "presentation_pdf_id" integer;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "press_kit_page"
    ADD CONSTRAINT "press_kit_page_presentation_pdf_id_media_id_fk"
    FOREIGN KEY ("presentation_pdf_id") REFERENCES "media"("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS "press_kit_page_presentation_pdf_idx"
  ON "press_kit_page" ("presentation_pdf_id");

CREATE TABLE IF NOT EXISTS "press_kit_page_locales" (
  "seo_title" varchar DEFAULT 'Dossier de presse — IGM',
  "seo_description" varchar,
  "hero_title" varchar DEFAULT 'Dossier de presse',
  "hero_lead" varchar,
  "intro" varchar,
  "download_label" varchar DEFAULT 'Télécharger le dossier',
  "id" serial PRIMARY KEY NOT NULL,
  "_locale" "_locales" NOT NULL,
  "_parent_id" integer NOT NULL
);

DO $$ BEGIN
  ALTER TABLE "press_kit_page_locales"
    ADD CONSTRAINT "press_kit_page_locales_parent_id_fk"
    FOREIGN KEY ("_parent_id") REFERENCES "press_kit_page"("id") ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE UNIQUE INDEX IF NOT EXISTS "press_kit_page_locales_locale_parent_id_unique"
  ON "press_kit_page_locales" ("_locale", "_parent_id");
-- Bannière page Dossier de presse
ALTER TABLE "page_heroes" ADD COLUMN IF NOT EXISTS "press_kit_hero_image_id" integer;

DO $$ BEGIN
  ALTER TABLE "page_heroes"
    ADD CONSTRAINT "page_heroes_press_kit_hero_image_id_media_id_fk"
    FOREIGN KEY ("press_kit_hero_image_id") REFERENCES "media"("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS "page_heroes_press_kit_hero_image_idx"
  ON "page_heroes" ("press_kit_hero_image_id");
