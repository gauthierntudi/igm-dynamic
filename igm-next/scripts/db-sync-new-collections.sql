-- Alignement schéma Payload : contact-messages, legislation-documents, payload_locked_documents_rels
-- Généré à partir de payload generate:db-schema (Payload 3.85)

-- ── Enums ───────────────────────────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE "enum_contact_messages_locale" AS ENUM ('fr', 'en');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "enum_contact_messages_status" AS ENUM ('nouveau', 'lu');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "enum_legislation_documents_category" AS ENUM ('ordinances', 'laws', 'decrees', 'decisions');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "enum_legislation_documents_status" AS ENUM ('draft', 'published');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "enum__legislation_documents_v_version_category" AS ENUM ('ordinances', 'laws', 'decrees', 'decisions');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "enum__legislation_documents_v_version_status" AS ENUM ('draft', 'published');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "enum__legislation_documents_v_published_locale" AS ENUM ('fr', 'en');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── contact_messages ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "contact_messages" (
  "id" serial PRIMARY KEY,
  "name" varchar NOT NULL,
  "email" varchar NOT NULL,
  "phone" varchar,
  "subject" varchar NOT NULL,
  "message" varchar NOT NULL,
  "locale" "enum_contact_messages_locale",
  "status" "enum_contact_messages_status" DEFAULT 'nouveau',
  "notes_internes" varchar,
  "updated_at" timestamptz(3) NOT NULL DEFAULT now(),
  "created_at" timestamptz(3) NOT NULL DEFAULT now()
);

ALTER TABLE "contact_messages" ADD COLUMN IF NOT EXISTS "notes_internes" varchar;

DO $$ BEGIN
  ALTER TABLE "contact_messages"
    ALTER COLUMN "locale" TYPE "enum_contact_messages_locale"
    USING "locale"::text::"enum_contact_messages_locale";
EXCEPTION
  WHEN undefined_column THEN NULL;
  WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "contact_messages"
    ALTER COLUMN "status" TYPE "enum_contact_messages_status"
    USING "status"::text::"enum_contact_messages_status";
EXCEPTION
  WHEN others THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS "contact_messages_updated_at_idx" ON "contact_messages" ("updated_at");
CREATE INDEX IF NOT EXISTS "contact_messages_created_at_idx" ON "contact_messages" ("created_at");

-- ── legislation_documents (schéma Payload : title/summary dans _locales) ─────
CREATE TABLE IF NOT EXISTS "legislation_documents" (
  "id" serial PRIMARY KEY,
  "category" "enum_legislation_documents_category",
  "reference" varchar,
  "published_at" timestamptz(3),
  "order" numeric DEFAULT 0,
  "file_id" integer,
  "updated_at" timestamptz(3) NOT NULL DEFAULT now(),
  "created_at" timestamptz(3) NOT NULL DEFAULT now(),
  "_status" "enum_legislation_documents_status" DEFAULT 'draft'
);

CREATE TABLE IF NOT EXISTS "legislation_documents_locales" (
  "id" serial PRIMARY KEY,
  "title" varchar,
  "summary" varchar,
  "_locale" "_locales" NOT NULL,
  "_parent_id" integer NOT NULL
);

DO $$ BEGIN
  ALTER TABLE "legislation_documents_locales"
    ADD CONSTRAINT "legislation_documents_locales_parent_id_fk"
    FOREIGN KEY ("_parent_id") REFERENCES "legislation_documents"("id") ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE UNIQUE INDEX IF NOT EXISTS "legislation_documents_locales_locale_parent_id_unique"
  ON "legislation_documents_locales" ("_locale", "_parent_id");

DO $$ BEGIN
  ALTER TABLE "legislation_documents_locales"
    ALTER COLUMN "_locale" TYPE "_locales"
    USING "_locale"::text::_locales;
EXCEPTION WHEN others THEN NULL; END $$;

-- Migration depuis l'ancien script manuel (title/summary sur la table principale)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'legislation_documents' AND column_name = 'title'
  ) THEN
    INSERT INTO "legislation_documents_locales" ("title", "summary", "_locale", "_parent_id")
    SELECT ld."title", ld."summary", 'fr'::_locales, ld."id"
    FROM "legislation_documents" ld
    WHERE ld."title" IS NOT NULL
      AND NOT EXISTS (
        SELECT 1 FROM "legislation_documents_locales" loc
        WHERE loc."_parent_id" = ld."id" AND loc."_locale" = 'fr'::_locales
      );

    ALTER TABLE "legislation_documents" DROP COLUMN IF EXISTS "title";
    ALTER TABLE "legislation_documents" DROP COLUMN IF EXISTS "summary";
  END IF;
END $$;

ALTER TABLE "legislation_documents" ADD COLUMN IF NOT EXISTS "category" "enum_legislation_documents_category";
ALTER TABLE "legislation_documents" ADD COLUMN IF NOT EXISTS "reference" varchar;
ALTER TABLE "legislation_documents" ADD COLUMN IF NOT EXISTS "published_at" timestamptz(3);
ALTER TABLE "legislation_documents" ADD COLUMN IF NOT EXISTS "order" numeric DEFAULT 0;
ALTER TABLE "legislation_documents" ADD COLUMN IF NOT EXISTS "file_id" integer;
ALTER TABLE "legislation_documents" ADD COLUMN IF NOT EXISTS "_status" "enum_legislation_documents_status" DEFAULT 'draft';

DO $$ BEGIN
  ALTER TABLE "legislation_documents"
    ALTER COLUMN "category" TYPE "enum_legislation_documents_category"
    USING "category"::text::"enum_legislation_documents_category";
EXCEPTION WHEN others THEN NULL; END $$;

DO $$ BEGIN
  UPDATE "legislation_documents"
  SET "_status" = 'draft'
  WHERE "_status" IS NULL OR "_status" NOT IN ('draft', 'published');

  ALTER TABLE "legislation_documents" ALTER COLUMN "_status" DROP DEFAULT;
  ALTER TABLE "legislation_documents"
    ALTER COLUMN "_status" TYPE "enum_legislation_documents_status"
    USING "_status"::text::"enum_legislation_documents_status";
  ALTER TABLE "legislation_documents"
    ALTER COLUMN "_status" SET DEFAULT 'draft'::"enum_legislation_documents_status";
EXCEPTION WHEN others THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "legislation_documents"
    ADD CONSTRAINT "legislation_documents_file_id_media_id_fk"
    FOREIGN KEY ("file_id") REFERENCES "media"("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS "legislation_documents_file_idx" ON "legislation_documents" ("file_id");
CREATE INDEX IF NOT EXISTS "legislation_documents_updated_at_idx" ON "legislation_documents" ("updated_at");
CREATE INDEX IF NOT EXISTS "legislation_documents_created_at_idx" ON "legislation_documents" ("created_at");
CREATE INDEX IF NOT EXISTS "legislation_documents__status_idx" ON "legislation_documents" ("_status");

-- ── Versions legislation_documents ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "_legislation_documents_v" (
  "id" serial PRIMARY KEY,
  "parent_id" integer,
  "version_category" "enum__legislation_documents_v_version_category",
  "version_reference" varchar,
  "version_published_at" timestamptz(3),
  "version_order" numeric DEFAULT 0,
  "version_file_id" integer,
  "version_updated_at" timestamptz(3),
  "version_created_at" timestamptz(3),
  "version__status" "enum__legislation_documents_v_version_status" DEFAULT 'draft',
  "created_at" timestamptz(3) NOT NULL DEFAULT now(),
  "updated_at" timestamptz(3) NOT NULL DEFAULT now(),
  "snapshot" boolean,
  "published_locale" "enum__legislation_documents_v_published_locale",
  "latest" boolean
);

ALTER TABLE "_legislation_documents_v" ADD COLUMN IF NOT EXISTS "version_category" "enum__legislation_documents_v_version_category";
ALTER TABLE "_legislation_documents_v" ADD COLUMN IF NOT EXISTS "version_reference" varchar;
ALTER TABLE "_legislation_documents_v" ADD COLUMN IF NOT EXISTS "version_published_at" timestamptz(3);
ALTER TABLE "_legislation_documents_v" ADD COLUMN IF NOT EXISTS "version_order" numeric DEFAULT 0;
ALTER TABLE "_legislation_documents_v" ADD COLUMN IF NOT EXISTS "version_file_id" integer;
ALTER TABLE "_legislation_documents_v" ADD COLUMN IF NOT EXISTS "version_updated_at" timestamptz(3);
ALTER TABLE "_legislation_documents_v" ADD COLUMN IF NOT EXISTS "version_created_at" timestamptz(3);
ALTER TABLE "_legislation_documents_v" ADD COLUMN IF NOT EXISTS "version__status" "enum__legislation_documents_v_version_status" DEFAULT 'draft';
ALTER TABLE "_legislation_documents_v" ADD COLUMN IF NOT EXISTS "created_at" timestamptz(3) NOT NULL DEFAULT now();
ALTER TABLE "_legislation_documents_v" ADD COLUMN IF NOT EXISTS "updated_at" timestamptz(3) NOT NULL DEFAULT now();
ALTER TABLE "_legislation_documents_v" ADD COLUMN IF NOT EXISTS "snapshot" boolean;
ALTER TABLE "_legislation_documents_v" ADD COLUMN IF NOT EXISTS "published_locale" "enum__legislation_documents_v_published_locale";
ALTER TABLE "_legislation_documents_v" ADD COLUMN IF NOT EXISTS "latest" boolean;

DO $$ BEGIN
  ALTER TABLE "_legislation_documents_v"
    ALTER COLUMN "version_category" TYPE "enum__legislation_documents_v_version_category"
    USING "version_category"::text::"enum__legislation_documents_v_version_category";
EXCEPTION WHEN others THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "_legislation_documents_v"
    ALTER COLUMN "version__status" TYPE "enum__legislation_documents_v_version_status"
    USING "version__status"::text::"enum__legislation_documents_v_version_status";
EXCEPTION WHEN others THEN NULL; END $$;

-- Migrer version_title/summary vers _legislation_documents_v_locales
CREATE TABLE IF NOT EXISTS "_legislation_documents_v_locales" (
  "id" serial PRIMARY KEY,
  "version_title" varchar,
  "version_summary" varchar,
  "_locale" "_locales" NOT NULL,
  "_parent_id" integer NOT NULL
);

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = '_legislation_documents_v' AND column_name = 'version_title'
  ) THEN
    INSERT INTO "_legislation_documents_v_locales" ("version_title", "version_summary", "_locale", "_parent_id")
    SELECT v."version_title", v."version_summary", 'fr'::_locales, v."id"
    FROM "_legislation_documents_v" v
    WHERE v."version_title" IS NOT NULL
      AND NOT EXISTS (
        SELECT 1 FROM "_legislation_documents_v_locales" loc
        WHERE loc."_parent_id" = v."id" AND loc."_locale" = 'fr'::_locales
      );
  END IF;
END $$;

-- Ancien script : colonnes version_title etc. sur la table principale des versions
ALTER TABLE "_legislation_documents_v" DROP COLUMN IF EXISTS "version_title";
ALTER TABLE "_legislation_documents_v" DROP COLUMN IF EXISTS "version_summary";
ALTER TABLE "_legislation_documents_v" DROP COLUMN IF EXISTS "autosave";

DO $$ BEGIN
  ALTER TABLE "_legislation_documents_v"
    ADD CONSTRAINT "_legislation_documents_v_parent_id_legislation_documents_id_fk"
    FOREIGN KEY ("parent_id") REFERENCES "legislation_documents"("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "_legislation_documents_v"
    ADD CONSTRAINT "_legislation_documents_v_version_file_id_media_id_fk"
    FOREIGN KEY ("version_file_id") REFERENCES "media"("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS "_legislation_documents_v_parent_idx" ON "_legislation_documents_v" ("parent_id");
CREATE INDEX IF NOT EXISTS "_legislation_documents_v_version_version_file_idx" ON "_legislation_documents_v" ("version_file_id");
CREATE INDEX IF NOT EXISTS "_legislation_documents_v_version_version_updated_at_idx" ON "_legislation_documents_v" ("version_updated_at");
CREATE INDEX IF NOT EXISTS "_legislation_documents_v_version_version_created_at_idx" ON "_legislation_documents_v" ("version_created_at");
CREATE INDEX IF NOT EXISTS "_legislation_documents_v_version_version__status_idx" ON "_legislation_documents_v" ("version__status");
CREATE INDEX IF NOT EXISTS "_legislation_documents_v_created_at_idx" ON "_legislation_documents_v" ("created_at");
CREATE INDEX IF NOT EXISTS "_legislation_documents_v_updated_at_idx" ON "_legislation_documents_v" ("updated_at");
CREATE INDEX IF NOT EXISTS "_legislation_documents_v_snapshot_idx" ON "_legislation_documents_v" ("snapshot");
CREATE INDEX IF NOT EXISTS "_legislation_documents_v_published_locale_idx" ON "_legislation_documents_v" ("published_locale");
CREATE INDEX IF NOT EXISTS "_legislation_documents_v_latest_idx" ON "_legislation_documents_v" ("latest");

DO $$ BEGIN
  ALTER TABLE "_legislation_documents_v_locales"
    ADD CONSTRAINT "_legislation_documents_v_locales_parent_id_fk"
    FOREIGN KEY ("_parent_id") REFERENCES "_legislation_documents_v"("id") ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE UNIQUE INDEX IF NOT EXISTS "_legislation_documents_v_locales_locale_parent_id_unique"
  ON "_legislation_documents_v_locales" ("_locale", "_parent_id");

-- ── payload_locked_documents_rels (cause de « Something went wrong ») ─────────
ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "contact_messages_id" integer;
ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "legislation_documents_id" integer;

CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_contact_messages_id_idx"
  ON "payload_locked_documents_rels" ("contact_messages_id");
CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_legislation_documents_id_idx"
  ON "payload_locked_documents_rels" ("legislation_documents_id");

DO $$ BEGIN
  ALTER TABLE "payload_locked_documents_rels"
    ADD CONSTRAINT "payload_locked_documents_rels_contact_messages_fk"
    FOREIGN KEY ("contact_messages_id") REFERENCES "contact_messages"("id") ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "payload_locked_documents_rels"
    ADD CONSTRAINT "payload_locked_documents_rels_legislation_documents_fk"
    FOREIGN KEY ("legislation_documents_id") REFERENCES "legislation_documents"("id") ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
