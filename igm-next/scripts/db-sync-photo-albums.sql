-- Collection Payload « photo-albums » (albums photos médiathèque)

DO $$ BEGIN
  CREATE TYPE "enum_photo_albums_status" AS ENUM ('draft', 'published');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "enum__photo_albums_v_version_status" AS ENUM ('draft', 'published');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "enum__photo_albums_v_published_locale" AS ENUM ('fr', 'en');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "photo_albums" (
  "id" serial PRIMARY KEY,
  "cover_image_id" integer,
  "published_at" timestamptz(3),
  "order" numeric DEFAULT 0,
  "updated_at" timestamptz(3) NOT NULL DEFAULT now(),
  "created_at" timestamptz(3) NOT NULL DEFAULT now(),
  "_status" "enum_photo_albums_status" DEFAULT 'draft'
);

CREATE TABLE IF NOT EXISTS "photo_albums_locales" (
  "id" serial PRIMARY KEY,
  "title" varchar,
  "summary" varchar,
  "slug" varchar,
  "_locale" "_locales" NOT NULL,
  "_parent_id" integer NOT NULL
);

CREATE TABLE IF NOT EXISTS "photo_albums_rels" (
  "id" serial PRIMARY KEY,
  "order" integer,
  "parent_id" integer NOT NULL,
  "path" varchar NOT NULL,
  "media_id" integer
);

DO $$ BEGIN
  ALTER TABLE "photo_albums_locales"
    ADD CONSTRAINT "photo_albums_locales_parent_id_fk"
    FOREIGN KEY ("_parent_id") REFERENCES "photo_albums"("id") ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "photo_albums"
    ADD CONSTRAINT "photo_albums_cover_image_id_media_id_fk"
    FOREIGN KEY ("cover_image_id") REFERENCES "media"("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "photo_albums_rels"
    ADD CONSTRAINT "photo_albums_rels_parent_fk"
    FOREIGN KEY ("parent_id") REFERENCES "photo_albums"("id") ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "photo_albums_rels"
    ADD CONSTRAINT "photo_albums_rels_media_fk"
    FOREIGN KEY ("media_id") REFERENCES "media"("id") ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE UNIQUE INDEX IF NOT EXISTS "photo_albums_locales_locale_parent_id_unique"
  ON "photo_albums_locales" ("_locale", "_parent_id");

-- slugField Payload (generateSlug)
ALTER TABLE "photo_albums_locales" ADD COLUMN IF NOT EXISTS "generate_slug" boolean DEFAULT true;
ALTER TABLE "_photo_albums_v_locales" ADD COLUMN IF NOT EXISTS "version_generate_slug" boolean DEFAULT true;

CREATE UNIQUE INDEX IF NOT EXISTS "photo_albums_slug_idx"
  ON "photo_albums_locales" ("slug", "_locale");

CREATE INDEX IF NOT EXISTS "photo_albums_cover_image_idx" ON "photo_albums" ("cover_image_id");
CREATE INDEX IF NOT EXISTS "photo_albums_updated_at_idx" ON "photo_albums" ("updated_at");
CREATE INDEX IF NOT EXISTS "photo_albums_created_at_idx" ON "photo_albums" ("created_at");
CREATE INDEX IF NOT EXISTS "photo_albums__status_idx" ON "photo_albums" ("_status");
CREATE INDEX IF NOT EXISTS "photo_albums_rels_order_idx" ON "photo_albums_rels" ("order");
CREATE INDEX IF NOT EXISTS "photo_albums_rels_parent_idx" ON "photo_albums_rels" ("parent_id");
CREATE INDEX IF NOT EXISTS "photo_albums_rels_path_idx" ON "photo_albums_rels" ("path");
CREATE INDEX IF NOT EXISTS "photo_albums_rels_media_id_idx" ON "photo_albums_rels" ("media_id");

CREATE TABLE IF NOT EXISTS "_photo_albums_v" (
  "id" serial PRIMARY KEY,
  "parent_id" integer,
  "version_cover_image_id" integer,
  "version_published_at" timestamptz(3),
  "version_order" numeric DEFAULT 0,
  "version_updated_at" timestamptz(3),
  "version_created_at" timestamptz(3),
  "version__status" "enum__photo_albums_v_version_status" DEFAULT 'draft',
  "created_at" timestamptz(3) NOT NULL DEFAULT now(),
  "updated_at" timestamptz(3) NOT NULL DEFAULT now(),
  "snapshot" boolean,
  "published_locale" "enum__photo_albums_v_published_locale",
  "latest" boolean
);

CREATE TABLE IF NOT EXISTS "_photo_albums_v_locales" (
  "id" serial PRIMARY KEY,
  "version_title" varchar,
  "version_summary" varchar,
  "version_slug" varchar,
  "_locale" "_locales" NOT NULL,
  "_parent_id" integer NOT NULL
);

CREATE TABLE IF NOT EXISTS "_photo_albums_v_rels" (
  "id" serial PRIMARY KEY,
  "order" integer,
  "parent_id" integer NOT NULL,
  "path" varchar NOT NULL,
  "media_id" integer
);

DO $$ BEGIN
  ALTER TABLE "_photo_albums_v"
    ADD CONSTRAINT "_photo_albums_v_parent_id_photo_albums_id_fk"
    FOREIGN KEY ("parent_id") REFERENCES "photo_albums"("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "_photo_albums_v"
    ADD CONSTRAINT "_photo_albums_v_version_cover_image_id_media_id_fk"
    FOREIGN KEY ("version_cover_image_id") REFERENCES "media"("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "_photo_albums_v_locales"
    ADD CONSTRAINT "_photo_albums_v_locales_parent_id_fk"
    FOREIGN KEY ("_parent_id") REFERENCES "_photo_albums_v"("id") ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "_photo_albums_v_rels"
    ADD CONSTRAINT "_photo_albums_v_rels_parent_fk"
    FOREIGN KEY ("parent_id") REFERENCES "_photo_albums_v"("id") ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "_photo_albums_v_rels"
    ADD CONSTRAINT "_photo_albums_v_rels_media_fk"
    FOREIGN KEY ("media_id") REFERENCES "media"("id") ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE UNIQUE INDEX IF NOT EXISTS "_photo_albums_v_locales_locale_parent_id_unique"
  ON "_photo_albums_v_locales" ("_locale", "_parent_id");

CREATE INDEX IF NOT EXISTS "_photo_albums_v_parent_idx" ON "_photo_albums_v" ("parent_id");
CREATE INDEX IF NOT EXISTS "_photo_albums_v_version_cover_image_idx" ON "_photo_albums_v" ("version_cover_image_id");
CREATE INDEX IF NOT EXISTS "_photo_albums_v_version_updated_at_idx" ON "_photo_albums_v" ("version_updated_at");
CREATE INDEX IF NOT EXISTS "_photo_albums_v_version_created_at_idx" ON "_photo_albums_v" ("version_created_at");
CREATE INDEX IF NOT EXISTS "_photo_albums_v_version__status_idx" ON "_photo_albums_v" ("version__status");
CREATE INDEX IF NOT EXISTS "_photo_albums_v_created_at_idx" ON "_photo_albums_v" ("created_at");
CREATE INDEX IF NOT EXISTS "_photo_albums_v_updated_at_idx" ON "_photo_albums_v" ("updated_at");
CREATE INDEX IF NOT EXISTS "_photo_albums_v_snapshot_idx" ON "_photo_albums_v" ("snapshot");
CREATE INDEX IF NOT EXISTS "_photo_albums_v_published_locale_idx" ON "_photo_albums_v" ("published_locale");
CREATE INDEX IF NOT EXISTS "_photo_albums_v_latest_idx" ON "_photo_albums_v" ("latest");
CREATE INDEX IF NOT EXISTS "_photo_albums_v_rels_order_idx" ON "_photo_albums_v_rels" ("order");
CREATE INDEX IF NOT EXISTS "_photo_albums_v_rels_parent_idx" ON "_photo_albums_v_rels" ("parent_id");
CREATE INDEX IF NOT EXISTS "_photo_albums_v_rels_path_idx" ON "_photo_albums_v_rels" ("path");
CREATE INDEX IF NOT EXISTS "_photo_albums_v_rels_media_id_idx" ON "_photo_albums_v_rels" ("media_id");

ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "photo_albums_id" integer;

CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_photo_albums_id_idx"
  ON "payload_locked_documents_rels" ("photo_albums_id");

DO $$ BEGIN
  ALTER TABLE "payload_locked_documents_rels"
    ADD CONSTRAINT "payload_locked_documents_rels_photo_albums_fk"
    FOREIGN KEY ("photo_albums_id") REFERENCES "photo_albums"("id") ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Photos en lignes array (image + légende) — migration depuis hasMany (photo_albums_rels)
CREATE TABLE IF NOT EXISTS "photo_albums_photos" (
  "_order" integer NOT NULL,
  "_parent_id" integer NOT NULL,
  "id" varchar PRIMARY KEY NOT NULL,
  "image_id" integer
);

CREATE TABLE IF NOT EXISTS "photo_albums_photos_locales" (
  "caption" varchar,
  "id" serial PRIMARY KEY NOT NULL,
  "_locale" "_locales" NOT NULL,
  "_parent_id" varchar NOT NULL
);

DO $$ BEGIN
  ALTER TABLE "photo_albums_photos"
    ADD CONSTRAINT "photo_albums_photos_parent_id_fk"
    FOREIGN KEY ("_parent_id") REFERENCES "photo_albums"("id") ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "photo_albums_photos"
    ADD CONSTRAINT "photo_albums_photos_image_id_media_id_fk"
    FOREIGN KEY ("image_id") REFERENCES "media"("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "photo_albums_photos_locales"
    ADD CONSTRAINT "photo_albums_photos_locales_parent_id_fk"
    FOREIGN KEY ("_parent_id") REFERENCES "photo_albums_photos"("id") ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS "photo_albums_photos_order_idx" ON "photo_albums_photos" ("_order");
CREATE INDEX IF NOT EXISTS "photo_albums_photos_parent_id_idx" ON "photo_albums_photos" ("_parent_id");
CREATE INDEX IF NOT EXISTS "photo_albums_photos_image_idx" ON "photo_albums_photos" ("image_id");
CREATE UNIQUE INDEX IF NOT EXISTS "photo_albums_photos_locales_locale_parent_id_unique"
  ON "photo_albums_photos_locales" ("_locale", "_parent_id");

-- Versions drafts : Payload (idToUUID) attend id SERIAL + _uuid (pas id varchar)
-- Si une ancienne version varchar existe, on la recrée proprement.
DO $$ BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = '_photo_albums_v_version_photos'
      AND column_name = 'id'
      AND data_type = 'character varying'
  ) THEN
    DROP TABLE IF EXISTS "_photo_albums_v_version_photos_locales" CASCADE;
    DROP TABLE IF EXISTS "_photo_albums_v_version_photos" CASCADE;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS "_photo_albums_v_version_photos" (
  "_order" integer NOT NULL,
  "_parent_id" integer NOT NULL,
  "id" serial PRIMARY KEY NOT NULL,
  "image_id" integer,
  "_uuid" varchar
);

CREATE TABLE IF NOT EXISTS "_photo_albums_v_version_photos_locales" (
  "caption" varchar,
  "id" serial PRIMARY KEY NOT NULL,
  "_locale" "_locales" NOT NULL,
  "_parent_id" integer NOT NULL
);

DO $$ BEGIN
  ALTER TABLE "_photo_albums_v_version_photos"
    ADD CONSTRAINT "_photo_albums_v_version_photos_parent_id_fk"
    FOREIGN KEY ("_parent_id") REFERENCES "_photo_albums_v"("id") ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "_photo_albums_v_version_photos"
    ADD CONSTRAINT "_photo_albums_v_version_photos_image_id_media_id_fk"
    FOREIGN KEY ("image_id") REFERENCES "media"("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "_photo_albums_v_version_photos_locales"
    ADD CONSTRAINT "_photo_albums_v_version_photos_locales_parent_id_fk"
    FOREIGN KEY ("_parent_id") REFERENCES "_photo_albums_v_version_photos"("id") ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS "_photo_albums_v_version_photos_order_idx" ON "_photo_albums_v_version_photos" ("_order");
CREATE INDEX IF NOT EXISTS "_photo_albums_v_version_photos_parent_id_idx" ON "_photo_albums_v_version_photos" ("_parent_id");
CREATE INDEX IF NOT EXISTS "_photo_albums_v_version_photos_image_idx" ON "_photo_albums_v_version_photos" ("image_id");
CREATE UNIQUE INDEX IF NOT EXISTS "_photo_albums_v_version_photos_locales_locale_parent_id_un"
  ON "_photo_albums_v_version_photos_locales" ("_locale", "_parent_id");

-- Migrer les photos existantes (hasMany → array) une seule fois
INSERT INTO "photo_albums_photos" ("_order", "_parent_id", "id", "image_id")
SELECT
  COALESCE(r."order", 0),
  r."parent_id",
  'migrated-' || r."id"::text,
  r."media_id"
FROM "photo_albums_rels" r
WHERE r."path" = 'photos'
  AND r."media_id" IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM "photo_albums_photos" p
    WHERE p."_parent_id" = r."parent_id"
      AND p."image_id" = r."media_id"
  );

-- Versions : le path Payload est « version.photos » (pas « photos »)
INSERT INTO "_photo_albums_v_version_photos" ("_order", "_parent_id", "image_id", "_uuid")
SELECT
  COALESCE(r."order", 0),
  r."parent_id",
  r."media_id",
  'migrated-v-' || r."id"::text
FROM "_photo_albums_v_rels" r
WHERE r."path" IN ('version.photos', 'photos')
  AND r."media_id" IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM "_photo_albums_v_version_photos" p
    WHERE p."_parent_id" = r."parent_id"
      AND p."image_id" = r."media_id"
  );

-- media-gallery-items : retrait du champ category côté Payload (colonne conservée en base)
ALTER TABLE "media_gallery_items" ALTER COLUMN "category" DROP NOT NULL;
