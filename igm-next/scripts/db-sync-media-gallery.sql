-- Collection Payload « media-gallery-items » (galerie Photos / Vidéos)

DO $$ BEGIN
  CREATE TYPE "enum_media_gallery_items_category" AS ENUM ('photos', 'videos');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "enum_media_gallery_items_status" AS ENUM ('draft', 'published');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "enum__media_gallery_items_v_version_category" AS ENUM ('photos', 'videos');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "enum__media_gallery_items_v_version_status" AS ENUM ('draft', 'published');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "enum__media_gallery_items_v_published_locale" AS ENUM ('fr', 'en');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "media_gallery_items" (
  "id" serial PRIMARY KEY,
  "category" "enum_media_gallery_items_category",
  "published_at" timestamptz(3),
  "order" numeric DEFAULT 0,
  "media_id" integer,
  "updated_at" timestamptz(3) NOT NULL DEFAULT now(),
  "created_at" timestamptz(3) NOT NULL DEFAULT now(),
  "_status" "enum_media_gallery_items_status" DEFAULT 'draft'
);

CREATE TABLE IF NOT EXISTS "media_gallery_items_locales" (
  "id" serial PRIMARY KEY,
  "title" varchar,
  "summary" varchar,
  "caption" varchar,
  "_locale" "_locales" NOT NULL,
  "_parent_id" integer NOT NULL
);

DO $$ BEGIN
  ALTER TABLE "media_gallery_items_locales"
    ADD CONSTRAINT "media_gallery_items_locales_parent_id_fk"
    FOREIGN KEY ("_parent_id") REFERENCES "media_gallery_items"("id") ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE UNIQUE INDEX IF NOT EXISTS "media_gallery_items_locales_locale_parent_id_unique"
  ON "media_gallery_items_locales" ("_locale", "_parent_id");

ALTER TABLE "media_gallery_items" ADD COLUMN IF NOT EXISTS "category" "enum_media_gallery_items_category";
ALTER TABLE "media_gallery_items" ADD COLUMN IF NOT EXISTS "published_at" timestamptz(3);
ALTER TABLE "media_gallery_items" ADD COLUMN IF NOT EXISTS "order" numeric DEFAULT 0;
ALTER TABLE "media_gallery_items" ADD COLUMN IF NOT EXISTS "media_id" integer;
ALTER TABLE "media_gallery_items" ADD COLUMN IF NOT EXISTS "_status" "enum_media_gallery_items_status" DEFAULT 'draft';

DO $$ BEGIN
  ALTER TABLE "media_gallery_items"
    ADD CONSTRAINT "media_gallery_items_media_id_media_id_fk"
    FOREIGN KEY ("media_id") REFERENCES "media"("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS "media_gallery_items_media_idx" ON "media_gallery_items" ("media_id");
CREATE INDEX IF NOT EXISTS "media_gallery_items_updated_at_idx" ON "media_gallery_items" ("updated_at");
CREATE INDEX IF NOT EXISTS "media_gallery_items_created_at_idx" ON "media_gallery_items" ("created_at");
CREATE INDEX IF NOT EXISTS "media_gallery_items__status_idx" ON "media_gallery_items" ("_status");
CREATE INDEX IF NOT EXISTS "media_gallery_items_category_idx" ON "media_gallery_items" ("category");

CREATE TABLE IF NOT EXISTS "_media_gallery_items_v" (
  "id" serial PRIMARY KEY,
  "parent_id" integer,
  "version_category" "enum__media_gallery_items_v_version_category",
  "version_published_at" timestamptz(3),
  "version_order" numeric DEFAULT 0,
  "version_media_id" integer,
  "version_updated_at" timestamptz(3),
  "version_created_at" timestamptz(3),
  "version__status" "enum__media_gallery_items_v_version_status" DEFAULT 'draft',
  "created_at" timestamptz(3) NOT NULL DEFAULT now(),
  "updated_at" timestamptz(3) NOT NULL DEFAULT now(),
  "snapshot" boolean,
  "published_locale" "enum__media_gallery_items_v_published_locale",
  "latest" boolean
);

CREATE TABLE IF NOT EXISTS "_media_gallery_items_v_locales" (
  "id" serial PRIMARY KEY,
  "version_title" varchar,
  "version_summary" varchar,
  "version_caption" varchar,
  "_locale" "_locales" NOT NULL,
  "_parent_id" integer NOT NULL
);

DO $$ BEGIN
  ALTER TABLE "_media_gallery_items_v"
    ADD CONSTRAINT "_media_gallery_items_v_parent_id_media_gallery_items_id_fk"
    FOREIGN KEY ("parent_id") REFERENCES "media_gallery_items"("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "_media_gallery_items_v"
    ADD CONSTRAINT "_media_gallery_items_v_version_media_id_media_id_fk"
    FOREIGN KEY ("version_media_id") REFERENCES "media"("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "_media_gallery_items_v_locales"
    ADD CONSTRAINT "_media_gallery_items_v_locales_parent_id_fk"
    FOREIGN KEY ("_parent_id") REFERENCES "_media_gallery_items_v"("id") ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE UNIQUE INDEX IF NOT EXISTS "_media_gallery_items_v_locales_locale_parent_id_unique"
  ON "_media_gallery_items_v_locales" ("_locale", "_parent_id");

CREATE INDEX IF NOT EXISTS "_media_gallery_items_v_parent_idx" ON "_media_gallery_items_v" ("parent_id");
CREATE INDEX IF NOT EXISTS "_media_gallery_items_v_version_media_idx" ON "_media_gallery_items_v" ("version_media_id");
CREATE INDEX IF NOT EXISTS "_media_gallery_items_v_version_updated_at_idx" ON "_media_gallery_items_v" ("version_updated_at");
CREATE INDEX IF NOT EXISTS "_media_gallery_items_v_version_created_at_idx" ON "_media_gallery_items_v" ("version_created_at");
CREATE INDEX IF NOT EXISTS "_media_gallery_items_v_version__status_idx" ON "_media_gallery_items_v" ("version__status");
CREATE INDEX IF NOT EXISTS "_media_gallery_items_v_created_at_idx" ON "_media_gallery_items_v" ("created_at");
CREATE INDEX IF NOT EXISTS "_media_gallery_items_v_updated_at_idx" ON "_media_gallery_items_v" ("updated_at");
CREATE INDEX IF NOT EXISTS "_media_gallery_items_v_snapshot_idx" ON "_media_gallery_items_v" ("snapshot");
CREATE INDEX IF NOT EXISTS "_media_gallery_items_v_published_locale_idx" ON "_media_gallery_items_v" ("published_locale");
CREATE INDEX IF NOT EXISTS "_media_gallery_items_v_latest_idx" ON "_media_gallery_items_v" ("latest");

ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "media_gallery_items_id" integer;

CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_media_gallery_items_id_idx"
  ON "payload_locked_documents_rels" ("media_gallery_items_id");

DO $$ BEGIN
  ALTER TABLE "payload_locked_documents_rels"
    ADD CONSTRAINT "payload_locked_documents_rels_media_gallery_items_fk"
    FOREIGN KEY ("media_gallery_items_id") REFERENCES "media_gallery_items"("id") ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Lien YouTube (remplace l’upload fichier vidéo)
ALTER TABLE "media_gallery_items" ADD COLUMN IF NOT EXISTS "youtube_url" varchar;
ALTER TABLE "_media_gallery_items_v" ADD COLUMN IF NOT EXISTS "version_youtube_url" varchar;
