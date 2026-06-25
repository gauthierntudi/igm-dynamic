-- Section contact (home.contactSection.gallery)
CREATE TABLE IF NOT EXISTS "home_contact_section_gallery" (
  "_order" integer NOT NULL,
  "_parent_id" integer NOT NULL,
  "id" varchar PRIMARY KEY NOT NULL,
  "kind" varchar DEFAULT 'image',
  "image_id" integer,
  "video_id" integer,
  "display_width" numeric
);
CREATE INDEX IF NOT EXISTS "home_contact_section_gallery_order_idx"
  ON "home_contact_section_gallery" ("_order");
CREATE INDEX IF NOT EXISTS "home_contact_section_gallery_parent_id_idx"
  ON "home_contact_section_gallery" ("_parent_id");
DO $$ BEGIN
  ALTER TABLE "home_contact_section_gallery"
    ADD CONSTRAINT "home_contact_section_gallery_parent_id_fk"
    FOREIGN KEY ("_parent_id") REFERENCES "home"("id") ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "home_contact_section_gallery"
    ADD CONSTRAINT "home_contact_section_gallery_image_id_media_id_fk"
    FOREIGN KEY ("image_id") REFERENCES "media"("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "home_contact_section_gallery"
    ADD CONSTRAINT "home_contact_section_gallery_video_id_media_id_fk"
    FOREIGN KEY ("video_id") REFERENCES "media"("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE INDEX IF NOT EXISTS "home_contact_section_gallery_image_idx"
  ON "home_contact_section_gallery" ("image_id");
CREATE INDEX IF NOT EXISTS "home_contact_section_gallery_video_idx"
  ON "home_contact_section_gallery" ("video_id");

CREATE TABLE IF NOT EXISTS "home_contact_section_gallery_locales" (
  "alt" varchar,
  "id" serial PRIMARY KEY NOT NULL,
  "_locale" "_locales" NOT NULL,
  "_parent_id" varchar NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "home_contact_section_gallery_locales_locale_parent_id_unique"
  ON "home_contact_section_gallery_locales" ("_locale", "_parent_id");
DO $$ BEGIN
  ALTER TABLE "home_contact_section_gallery_locales"
    ADD CONSTRAINT "home_contact_section_gallery_locales_parent_id_fk"
    FOREIGN KEY ("_parent_id") REFERENCES "home_contact_section_gallery"("id") ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
