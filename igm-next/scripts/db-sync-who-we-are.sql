-- Global Payload « who-we-are » (page À propos)
DO $$ BEGIN CREATE TYPE "enum_who_we_are_cta_section_link_nav_link" AS ENUM ('/','/a-propos','/historique','/mission','/vision','/organigramme','/cartographie','/fraude-miniere','/contrebande-miniere','/denoncer','/sanctions','/actualites','/ordonnances','/lois','/decrets','/decisions','/photos','/videos','/audios','/contact','__custom__'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "enum_who_we_are_contact_section_primary_cta_nav_link" AS ENUM ('/','/a-propos','/historique','/mission','/vision','/organigramme','/cartographie','/fraude-miniere','/contrebande-miniere','/denoncer','/sanctions','/actualites','/ordonnances','/lois','/decrets','/decisions','/photos','/videos','/audios','/contact','__custom__'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "who_we_are" (
  "id" serial PRIMARY KEY NOT NULL,
  "hero_image_id" integer,
  "about_section_image_id" integer,
  "about_section_quote_author_photo_id" integer,
  "cta_section_link_nav_link" "enum_who_we_are_cta_section_link_nav_link",
  "cta_section_link_custom_href" varchar,
  "contact_section_primary_cta_nav_link" "enum_who_we_are_contact_section_primary_cta_nav_link",
  "contact_section_primary_cta_custom_href" varchar,
  "contact_section_phone_href" varchar DEFAULT 'tel:+243976844563',
  "contact_section_image_id" integer,
  "updated_at" timestamp(3) with time zone,
  "created_at" timestamp(3) with time zone
);

CREATE TABLE IF NOT EXISTS "who_we_are_locales" (
  "seo_title" varchar DEFAULT 'Qui sommes-nous ? — IGM',
  "seo_description" varchar,
  "headline" varchar,
  "intro" varchar,
  "nav_about_label" varchar DEFAULT 'À propos',
  "nav_history_label" varchar DEFAULT 'Historique',
  "nav_mission_label" varchar DEFAULT 'Mission',
  "about_section_title" varchar DEFAULT 'À propos de l''IGM',
  "about_section_body" varchar,
  "about_section_quote_text" varchar,
  "about_section_quote_author_name" varchar,
  "about_section_quote_author_role" varchar,
  "history_section_title" varchar DEFAULT 'Historique',
  "history_section_lead" varchar,
  "mission_section_title" varchar DEFAULT 'Mission',
  "mission_section_lead" varchar,
  "mission_section_headline" varchar DEFAULT 'Ensemble, nous renforçons la gouvernance minière',
  "mission_section_body" varchar,
  "mission_section_statutory_title" varchar DEFAULT 'Missions statutaires',
  "mission_section_priorities_title" varchar DEFAULT 'Priorités actuelles',
  "team_section_title" varchar DEFAULT 'Notre équipe de direction',
  "team_section_lead" varchar,
  "cta_section_title" varchar,
  "cta_section_text" varchar,
  "cta_section_link_label" varchar,
  "contact_section_title" varchar,
  "contact_section_lead" varchar,
  "contact_section_primary_cta_label" varchar,
  "contact_section_phone_label" varchar,
  "id" serial PRIMARY KEY NOT NULL,
  "_locale" "_locales" NOT NULL,
  "_parent_id" integer NOT NULL
);

CREATE TABLE IF NOT EXISTS "who_we_are_history_section_milestones" (
  "_order" integer NOT NULL,
  "_parent_id" integer NOT NULL,
  "id" varchar PRIMARY KEY NOT NULL,
  "year" varchar NOT NULL
);

CREATE TABLE IF NOT EXISTS "who_we_are_history_section_milestones_locales" (
  "title" varchar NOT NULL,
  "text" varchar,
  "id" serial PRIMARY KEY NOT NULL,
  "_locale" "_locales" NOT NULL,
  "_parent_id" varchar NOT NULL
);

CREATE TABLE IF NOT EXISTS "who_we_are_mission_section_statutory_items" (
  "_order" integer NOT NULL,
  "_parent_id" integer NOT NULL,
  "id" varchar PRIMARY KEY NOT NULL
);

CREATE TABLE IF NOT EXISTS "who_we_are_mission_section_statutory_items_locales" (
  "label" varchar NOT NULL,
  "id" serial PRIMARY KEY NOT NULL,
  "_locale" "_locales" NOT NULL,
  "_parent_id" varchar NOT NULL
);

CREATE TABLE IF NOT EXISTS "who_we_are_mission_section_priorities" (
  "_order" integer NOT NULL,
  "_parent_id" integer NOT NULL,
  "id" varchar PRIMARY KEY NOT NULL
);

CREATE TABLE IF NOT EXISTS "who_we_are_mission_section_priorities_locales" (
  "label" varchar NOT NULL,
  "id" serial PRIMARY KEY NOT NULL,
  "_locale" "_locales" NOT NULL,
  "_parent_id" varchar NOT NULL
);

CREATE TABLE IF NOT EXISTS "who_we_are_stats_section_items" (
  "_order" integer NOT NULL,
  "_parent_id" integer NOT NULL,
  "id" varchar PRIMARY KEY NOT NULL
);

CREATE TABLE IF NOT EXISTS "who_we_are_stats_section_items_locales" (
  "label" varchar NOT NULL,
  "value" varchar NOT NULL,
  "id" serial PRIMARY KEY NOT NULL,
  "_locale" "_locales" NOT NULL,
  "_parent_id" varchar NOT NULL
);

CREATE TABLE IF NOT EXISTS "who_we_are_team_section_members" (
  "_order" integer NOT NULL,
  "_parent_id" integer NOT NULL,
  "id" varchar PRIMARY KEY NOT NULL,
  "photo_id" integer
);

CREATE TABLE IF NOT EXISTS "who_we_are_team_section_members_locales" (
  "name" varchar NOT NULL,
  "role" varchar,
  "id" serial PRIMARY KEY NOT NULL,
  "_locale" "_locales" NOT NULL,
  "_parent_id" varchar NOT NULL
);

DO $$ BEGIN ALTER TABLE "who_we_are" ADD CONSTRAINT "who_we_are_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "media"("id") ON DELETE SET NULL; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "who_we_are" ADD CONSTRAINT "who_we_are_about_section_image_id_media_id_fk" FOREIGN KEY ("about_section_image_id") REFERENCES "media"("id") ON DELETE SET NULL; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "who_we_are" ADD CONSTRAINT "who_we_are_about_section_quote_author_photo_id_media_id_fk" FOREIGN KEY ("about_section_quote_author_photo_id") REFERENCES "media"("id") ON DELETE SET NULL; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "who_we_are" ADD CONSTRAINT "who_we_are_contact_section_image_id_media_id_fk" FOREIGN KEY ("contact_section_image_id") REFERENCES "media"("id") ON DELETE SET NULL; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "who_we_are_locales" ADD CONSTRAINT "who_we_are_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "who_we_are"("id") ON DELETE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "who_we_are_history_section_milestones" ADD CONSTRAINT "who_we_are_history_section_milestones_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "who_we_are"("id") ON DELETE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "who_we_are_history_section_milestones_locales" ADD CONSTRAINT "who_we_are_history_section_milestones_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "who_we_are_history_section_milestones"("id") ON DELETE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "who_we_are_mission_section_statutory_items" ADD CONSTRAINT "who_we_are_mission_section_statutory_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "who_we_are"("id") ON DELETE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "who_we_are_mission_section_statutory_items_locales" ADD CONSTRAINT "who_we_are_mission_section_statutory_items_locales_parent_fk" FOREIGN KEY ("_parent_id") REFERENCES "who_we_are_mission_section_statutory_items"("id") ON DELETE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "who_we_are_mission_section_priorities" ADD CONSTRAINT "who_we_are_mission_section_priorities_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "who_we_are"("id") ON DELETE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "who_we_are_mission_section_priorities_locales" ADD CONSTRAINT "who_we_are_mission_section_priorities_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "who_we_are_mission_section_priorities"("id") ON DELETE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "who_we_are_stats_section_items" ADD CONSTRAINT "who_we_are_stats_section_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "who_we_are"("id") ON DELETE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "who_we_are_stats_section_items_locales" ADD CONSTRAINT "who_we_are_stats_section_items_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "who_we_are_stats_section_items"("id") ON DELETE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "who_we_are_team_section_members" ADD CONSTRAINT "who_we_are_team_section_members_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "media"("id") ON DELETE SET NULL; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "who_we_are_team_section_members" ADD CONSTRAINT "who_we_are_team_section_members_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "who_we_are"("id") ON DELETE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "who_we_are_team_section_members_locales" ADD CONSTRAINT "who_we_are_team_section_members_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "who_we_are_team_section_members"("id") ON DELETE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS "who_we_are_history_section_milestones_order_idx" ON "who_we_are_history_section_milestones" ("_order");
CREATE INDEX IF NOT EXISTS "who_we_are_history_section_milestones_parent_id_idx" ON "who_we_are_history_section_milestones" ("_parent_id");
CREATE UNIQUE INDEX IF NOT EXISTS "who_we_are_history_section_milestones_locales_locale_parent_" ON "who_we_are_history_section_milestones_locales" ("_locale","_parent_id");
CREATE INDEX IF NOT EXISTS "who_we_are_mission_section_statutory_items_order_idx" ON "who_we_are_mission_section_statutory_items" ("_order");
CREATE INDEX IF NOT EXISTS "who_we_are_mission_section_statutory_items_parent_id_idx" ON "who_we_are_mission_section_statutory_items" ("_parent_id");
CREATE UNIQUE INDEX IF NOT EXISTS "who_we_are_mission_section_statutory_items_locales_locale_pa" ON "who_we_are_mission_section_statutory_items_locales" ("_locale","_parent_id");
CREATE INDEX IF NOT EXISTS "who_we_are_mission_section_priorities_order_idx" ON "who_we_are_mission_section_priorities" ("_order");
CREATE INDEX IF NOT EXISTS "who_we_are_mission_section_priorities_parent_id_idx" ON "who_we_are_mission_section_priorities" ("_parent_id");
CREATE UNIQUE INDEX IF NOT EXISTS "who_we_are_mission_section_priorities_locales_locale_parent_" ON "who_we_are_mission_section_priorities_locales" ("_locale","_parent_id");
CREATE INDEX IF NOT EXISTS "who_we_are_stats_section_items_order_idx" ON "who_we_are_stats_section_items" ("_order");
CREATE INDEX IF NOT EXISTS "who_we_are_stats_section_items_parent_id_idx" ON "who_we_are_stats_section_items" ("_parent_id");
CREATE UNIQUE INDEX IF NOT EXISTS "who_we_are_stats_section_items_locales_locale_parent_id_uniq" ON "who_we_are_stats_section_items_locales" ("_locale","_parent_id");
CREATE INDEX IF NOT EXISTS "who_we_are_team_section_members_order_idx" ON "who_we_are_team_section_members" ("_order");
CREATE INDEX IF NOT EXISTS "who_we_are_team_section_members_parent_id_idx" ON "who_we_are_team_section_members" ("_parent_id");
CREATE INDEX IF NOT EXISTS "who_we_are_team_section_members_photo_idx" ON "who_we_are_team_section_members" ("photo_id");
CREATE UNIQUE INDEX IF NOT EXISTS "who_we_are_team_section_members_locales_locale_parent_id_uni" ON "who_we_are_team_section_members_locales" ("_locale","_parent_id");
CREATE INDEX IF NOT EXISTS "who_we_are_hero_image_idx" ON "who_we_are" ("hero_image_id");
CREATE INDEX IF NOT EXISTS "who_we_are_about_section_about_section_image_idx" ON "who_we_are" ("about_section_image_id");
CREATE INDEX IF NOT EXISTS "who_we_are_about_section_quote_about_section_quote_autho_idx" ON "who_we_are" ("about_section_quote_author_photo_id");
CREATE INDEX IF NOT EXISTS "who_we_are_contact_section_contact_section_image_idx" ON "who_we_are" ("contact_section_image_id");
CREATE UNIQUE INDEX IF NOT EXISTS "who_we_are_locales_locale_parent_id_unique" ON "who_we_are_locales" ("_locale","_parent_id");

ALTER TABLE "who_we_are_locales" ADD COLUMN IF NOT EXISTS "history_section_body" varchar;
ALTER TABLE "who_we_are_locales" ADD COLUMN IF NOT EXISTS "history_section_headline" varchar;

INSERT INTO "who_we_are" ("id", "created_at", "updated_at")
SELECT 1, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM "who_we_are" WHERE "id" = 1);
