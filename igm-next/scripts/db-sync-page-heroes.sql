-- Global Payload « page-heroes » (bannières Présentation, LCFCM, Contact, Médiathèque)
CREATE TABLE IF NOT EXISTS "page_heroes" (
  "id" serial PRIMARY KEY NOT NULL,
  "org_chart_hero_image_id" integer,
  "map_hero_image_id" integer,
  "fraud_hero_image_id" integer,
  "smuggling_hero_image_id" integer,
  "sanctions_hero_image_id" integer,
  "report_hero_image_id" integer,
  "contact_hero_image_id" integer,
  "photos_hero_image_id" integer,
  "videos_hero_image_id" integer,
  "audios_hero_image_id" integer,
  "updated_at" timestamp(3) with time zone,
  "created_at" timestamp(3) with time zone
);

DO $$ BEGIN ALTER TABLE "page_heroes" ADD CONSTRAINT "page_heroes_org_chart_hero_image_id_media_id_fk" FOREIGN KEY ("org_chart_hero_image_id") REFERENCES "media"("id") ON DELETE SET NULL; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "page_heroes" ADD CONSTRAINT "page_heroes_map_hero_image_id_media_id_fk" FOREIGN KEY ("map_hero_image_id") REFERENCES "media"("id") ON DELETE SET NULL; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "page_heroes" ADD CONSTRAINT "page_heroes_fraud_hero_image_id_media_id_fk" FOREIGN KEY ("fraud_hero_image_id") REFERENCES "media"("id") ON DELETE SET NULL; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "page_heroes" ADD CONSTRAINT "page_heroes_smuggling_hero_image_id_media_id_fk" FOREIGN KEY ("smuggling_hero_image_id") REFERENCES "media"("id") ON DELETE SET NULL; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "page_heroes" ADD CONSTRAINT "page_heroes_sanctions_hero_image_id_media_id_fk" FOREIGN KEY ("sanctions_hero_image_id") REFERENCES "media"("id") ON DELETE SET NULL; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "page_heroes" ADD CONSTRAINT "page_heroes_report_hero_image_id_media_id_fk" FOREIGN KEY ("report_hero_image_id") REFERENCES "media"("id") ON DELETE SET NULL; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "page_heroes" ADD CONSTRAINT "page_heroes_contact_hero_image_id_media_id_fk" FOREIGN KEY ("contact_hero_image_id") REFERENCES "media"("id") ON DELETE SET NULL; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "page_heroes" ADD CONSTRAINT "page_heroes_photos_hero_image_id_media_id_fk" FOREIGN KEY ("photos_hero_image_id") REFERENCES "media"("id") ON DELETE SET NULL; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "page_heroes" ADD CONSTRAINT "page_heroes_videos_hero_image_id_media_id_fk" FOREIGN KEY ("videos_hero_image_id") REFERENCES "media"("id") ON DELETE SET NULL; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "page_heroes" ADD CONSTRAINT "page_heroes_audios_hero_image_id_media_id_fk" FOREIGN KEY ("audios_hero_image_id") REFERENCES "media"("id") ON DELETE SET NULL; EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS "page_heroes_org_chart_hero_image_idx" ON "page_heroes" ("org_chart_hero_image_id");
CREATE INDEX IF NOT EXISTS "page_heroes_map_hero_image_idx" ON "page_heroes" ("map_hero_image_id");
CREATE INDEX IF NOT EXISTS "page_heroes_fraud_hero_image_idx" ON "page_heroes" ("fraud_hero_image_id");
CREATE INDEX IF NOT EXISTS "page_heroes_smuggling_hero_image_idx" ON "page_heroes" ("smuggling_hero_image_id");
CREATE INDEX IF NOT EXISTS "page_heroes_sanctions_hero_image_idx" ON "page_heroes" ("sanctions_hero_image_id");
CREATE INDEX IF NOT EXISTS "page_heroes_report_hero_image_idx" ON "page_heroes" ("report_hero_image_id");
CREATE INDEX IF NOT EXISTS "page_heroes_contact_hero_image_idx" ON "page_heroes" ("contact_hero_image_id");
CREATE INDEX IF NOT EXISTS "page_heroes_photos_hero_image_idx" ON "page_heroes" ("photos_hero_image_id");
CREATE INDEX IF NOT EXISTS "page_heroes_videos_hero_image_idx" ON "page_heroes" ("videos_hero_image_id");
CREATE INDEX IF NOT EXISTS "page_heroes_audios_hero_image_idx" ON "page_heroes" ("audios_hero_image_id");
CREATE TABLE IF NOT EXISTS "page_heroes_locales" (
  "org_chart_hero_title" varchar,
  "org_chart_hero_subtitle" varchar,
  "map_hero_title" varchar,
  "map_hero_subtitle" varchar,
  "fraud_hero_title" varchar,
  "fraud_hero_subtitle" varchar,
  "smuggling_hero_title" varchar,
  "smuggling_hero_subtitle" varchar,
  "sanctions_hero_title" varchar,
  "sanctions_hero_subtitle" varchar,
  "report_hero_title" varchar,
  "report_hero_subtitle" varchar,
  "photos_hero_title" varchar,
  "photos_hero_subtitle" varchar,
  "videos_hero_title" varchar,
  "videos_hero_subtitle" varchar,
  "id" serial PRIMARY KEY NOT NULL,
  "_locale" "_locales" NOT NULL,
  "_parent_id" integer NOT NULL
);

DO $$ BEGIN
  ALTER TABLE "page_heroes_locales"
    ADD CONSTRAINT "page_heroes_locales_parent_id_fk"
    FOREIGN KEY ("_parent_id") REFERENCES "page_heroes"("id") ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE UNIQUE INDEX IF NOT EXISTS "page_heroes_locales_locale_parent_id_unique"
  ON "page_heroes_locales" ("_locale", "_parent_id");

ALTER TABLE "page_heroes_locales" ADD COLUMN IF NOT EXISTS "org_chart_hero_title" varchar;
ALTER TABLE "page_heroes_locales" ADD COLUMN IF NOT EXISTS "org_chart_hero_subtitle" varchar;
ALTER TABLE "page_heroes_locales" ADD COLUMN IF NOT EXISTS "map_hero_title" varchar;
ALTER TABLE "page_heroes_locales" ADD COLUMN IF NOT EXISTS "map_hero_subtitle" varchar;
ALTER TABLE "page_heroes_locales" ADD COLUMN IF NOT EXISTS "fraud_hero_title" varchar;
ALTER TABLE "page_heroes_locales" ADD COLUMN IF NOT EXISTS "fraud_hero_subtitle" varchar;
ALTER TABLE "page_heroes_locales" ADD COLUMN IF NOT EXISTS "smuggling_hero_title" varchar;
ALTER TABLE "page_heroes_locales" ADD COLUMN IF NOT EXISTS "smuggling_hero_subtitle" varchar;
ALTER TABLE "page_heroes_locales" ADD COLUMN IF NOT EXISTS "sanctions_hero_title" varchar;
ALTER TABLE "page_heroes_locales" ADD COLUMN IF NOT EXISTS "sanctions_hero_subtitle" varchar;
ALTER TABLE "page_heroes_locales" ADD COLUMN IF NOT EXISTS "report_hero_title" varchar;
ALTER TABLE "page_heroes_locales" ADD COLUMN IF NOT EXISTS "report_hero_subtitle" varchar;
ALTER TABLE "page_heroes_locales" ADD COLUMN IF NOT EXISTS "photos_hero_title" varchar;
ALTER TABLE "page_heroes_locales" ADD COLUMN IF NOT EXISTS "photos_hero_subtitle" varchar;
ALTER TABLE "page_heroes_locales" ADD COLUMN IF NOT EXISTS "videos_hero_title" varchar;
ALTER TABLE "page_heroes_locales" ADD COLUMN IF NOT EXISTS "videos_hero_subtitle" varchar;
