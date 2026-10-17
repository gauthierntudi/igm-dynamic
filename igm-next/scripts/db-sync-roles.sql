-- Rôles utilisateurs + global Autorisations
DO $$ BEGIN
  CREATE TYPE "enum_users_role" AS ENUM ('super-admin', 'technique', 'signalements', 'publication');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "role" "enum_users_role" DEFAULT 'super-admin';
UPDATE "users" SET "role" = 'super-admin' WHERE "role" IS NULL;
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'publication';
ALTER TABLE "users" ALTER COLUMN "role" SET NOT NULL;

ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "blocked" boolean DEFAULT false;
UPDATE "users" SET "blocked" = false WHERE "blocked" IS NULL;

ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "name" varchar;

CREATE TABLE IF NOT EXISTS "autorisations" (
  "id" serial PRIMARY KEY NOT NULL,
  "grants" jsonb,
  "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
);

INSERT INTO "autorisations" ("grants", "updated_at", "created_at")
SELECT NULL, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM "autorisations");
