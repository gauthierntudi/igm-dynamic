-- Global Payload « legislation » (bannières pages législation)
CREATE TABLE IF NOT EXISTS "legislation" (
  "id" serial PRIMARY KEY NOT NULL,
  "ordinances_hero_image_id" integer,
  "laws_hero_image_id" integer,
  "decrees_hero_image_id" integer,
  "decisions_hero_image_id" integer,
  "updated_at" timestamp(3) with time zone,
  "created_at" timestamp(3) with time zone
);

DO $$ BEGIN ALTER TABLE "legislation" ADD CONSTRAINT "legislation_ordinances_hero_image_id_media_id_fk" FOREIGN KEY ("ordinances_hero_image_id") REFERENCES "media"("id") ON DELETE SET NULL; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "legislation" ADD CONSTRAINT "legislation_laws_hero_image_id_media_id_fk" FOREIGN KEY ("laws_hero_image_id") REFERENCES "media"("id") ON DELETE SET NULL; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "legislation" ADD CONSTRAINT "legislation_decrees_hero_image_id_media_id_fk" FOREIGN KEY ("decrees_hero_image_id") REFERENCES "media"("id") ON DELETE SET NULL; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "legislation" ADD CONSTRAINT "legislation_decisions_hero_image_id_media_id_fk" FOREIGN KEY ("decisions_hero_image_id") REFERENCES "media"("id") ON DELETE SET NULL; EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS "legislation_ordinances_hero_image_idx" ON "legislation" ("ordinances_hero_image_id");
CREATE INDEX IF NOT EXISTS "legislation_laws_hero_image_idx" ON "legislation" ("laws_hero_image_id");
CREATE INDEX IF NOT EXISTS "legislation_decrees_hero_image_idx" ON "legislation" ("decrees_hero_image_id");
CREATE INDEX IF NOT EXISTS "legislation_decisions_hero_image_idx" ON "legislation" ("decisions_hero_image_id");

INSERT INTO "legislation" ("id", "created_at", "updated_at")
SELECT 1, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM "legislation" WHERE "id" = 1);

CREATE TABLE IF NOT EXISTS "legislation_locales" (
  "ordinances_hero_title" varchar,
  "ordinances_hero_subtitle" varchar,
  "laws_hero_title" varchar,
  "laws_hero_subtitle" varchar,
  "decrees_hero_title" varchar,
  "decrees_hero_subtitle" varchar,
  "decisions_hero_title" varchar,
  "decisions_hero_subtitle" varchar,
  "id" serial PRIMARY KEY NOT NULL,
  "_locale" "_locales" NOT NULL,
  "_parent_id" integer NOT NULL
);

DO $$ BEGIN
  ALTER TABLE "legislation_locales"
    ADD CONSTRAINT "legislation_locales_parent_id_fk"
    FOREIGN KEY ("_parent_id") REFERENCES "legislation"("id") ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE UNIQUE INDEX IF NOT EXISTS "legislation_locales_locale_parent_id_unique"
  ON "legislation_locales" ("_locale", "_parent_id");

ALTER TABLE "legislation_locales" ADD COLUMN IF NOT EXISTS "ordinances_hero_title" varchar;
ALTER TABLE "legislation_locales" ADD COLUMN IF NOT EXISTS "ordinances_hero_subtitle" varchar;
ALTER TABLE "legislation_locales" ADD COLUMN IF NOT EXISTS "laws_hero_title" varchar;
ALTER TABLE "legislation_locales" ADD COLUMN IF NOT EXISTS "laws_hero_subtitle" varchar;
ALTER TABLE "legislation_locales" ADD COLUMN IF NOT EXISTS "decrees_hero_title" varchar;
ALTER TABLE "legislation_locales" ADD COLUMN IF NOT EXISTS "decrees_hero_subtitle" varchar;
ALTER TABLE "legislation_locales" ADD COLUMN IF NOT EXISTS "decisions_hero_title" varchar;
ALTER TABLE "legislation_locales" ADD COLUMN IF NOT EXISTS "decisions_hero_subtitle" varchar;
