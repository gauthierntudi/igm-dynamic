-- Enums menu / footer (site_settings)
DO $$ BEGIN CREATE TYPE "enum_site_settings_header_nav_item_type" AS ENUM ('link', 'dropdown', 'report'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "enum_site_settings_header_nav_nested_icon" AS ENUM ('plus', 'caret'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "enum_site_settings_header_nav_children_item_type" AS ENUM ('link', 'dropdown', 'report'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "enum_site_settings_header_nav_children_nested_icon" AS ENUM ('plus', 'caret'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "enum_site_settings_header_nav_children_sub_items_item_type" AS ENUM ('link', 'dropdown', 'report'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "enum_site_settings_header_nav_children_sub_items_nested_icon" AS ENUM ('plus', 'caret'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "enum_site_settings_footer_social_network" AS ENUM ('facebook', 'linkedin', 'youtube', 'instagram', 'x'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE TYPE "enum_site_settings_header_nav_nav_link" AS ENUM ('/','/a-propos','/historique','/mission','/vision','/organigramme','/cartographie','/fraude-miniere','/contrebande-miniere','/denoncer','/sanctions','/actualites','/ordonnances','/lois','/decrets','/decisions','/photos','/videos','/audios','/contact','__custom__'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "enum_site_settings_header_nav_children_nav_link" AS ENUM ('/','/a-propos','/historique','/mission','/vision','/organigramme','/cartographie','/fraude-miniere','/contrebande-miniere','/denoncer','/sanctions','/actualites','/ordonnances','/lois','/decrets','/decisions','/photos','/videos','/audios','/contact','__custom__'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "enum_site_settings_header_nav_children_sub_items_nav_link" AS ENUM ('/','/a-propos','/historique','/mission','/vision','/organigramme','/cartographie','/fraude-miniere','/contrebande-miniere','/denoncer','/sanctions','/actualites','/ordonnances','/lois','/decrets','/decisions','/photos','/videos','/audios','/contact','__custom__'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "enum_site_settings_footer_columns_links_nav_link" AS ENUM ('/','/a-propos','/historique','/mission','/vision','/organigramme','/cartographie','/fraude-miniere','/contrebande-miniere','/denoncer','/sanctions','/actualites','/ordonnances','/lois','/decrets','/decisions','/photos','/videos','/audios','/contact','__custom__'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "enum_site_settings_footer_legal_links_nav_link" AS ENUM ('/','/a-propos','/historique','/mission','/vision','/organigramme','/cartographie','/fraude-miniere','/contrebande-miniere','/denoncer','/sanctions','/actualites','/ordonnances','/lois','/decrets','/decisions','/photos','/videos','/audios','/contact','__custom__'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Ancien schéma (children imbriqué) — supprimer avant recréation
DROP TABLE IF EXISTS "site_settings_header_nav_children_children_locales" CASCADE;
DROP TABLE IF EXISTS "site_settings_header_nav_children_children" CASCADE;

CREATE TABLE IF NOT EXISTS "site_settings_header_nav" (
  "_order" integer NOT NULL,
  "_parent_id" integer NOT NULL,
  "id" varchar PRIMARY KEY NOT NULL,
  "item_type" "enum_site_settings_header_nav_item_type" DEFAULT 'link' NOT NULL,
  "nav_link" "enum_site_settings_header_nav_nav_link",
  "custom_href" varchar,
  "css_class" varchar,
  "nested_icon" "enum_site_settings_header_nav_nested_icon" DEFAULT 'plus'
);
CREATE INDEX IF NOT EXISTS "site_settings_header_nav_order_idx" ON "site_settings_header_nav" ("_order");
CREATE INDEX IF NOT EXISTS "site_settings_header_nav_parent_id_idx" ON "site_settings_header_nav" ("_parent_id");
DO $$ BEGIN ALTER TABLE "site_settings_header_nav" ADD CONSTRAINT "site_settings_header_nav_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "site_settings"("id") ON DELETE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "site_settings_header_nav_locales" (
  "label" varchar NOT NULL,
  "id" serial PRIMARY KEY NOT NULL,
  "_locale" "_locales" NOT NULL,
  "_parent_id" varchar NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "site_settings_header_nav_locales_locale_parent_id_unique" ON "site_settings_header_nav_locales" ("_locale","_parent_id");
DO $$ BEGIN ALTER TABLE "site_settings_header_nav_locales" ADD CONSTRAINT "site_settings_header_nav_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "site_settings_header_nav"("id") ON DELETE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "site_settings_header_nav_children" (
  "_order" integer NOT NULL,
  "_parent_id" varchar NOT NULL,
  "id" varchar PRIMARY KEY NOT NULL,
  "item_type" "enum_site_settings_header_nav_children_item_type" DEFAULT 'link',
  "nav_link" "enum_site_settings_header_nav_children_nav_link",
  "custom_href" varchar,
  "css_class" varchar,
  "nested_icon" "enum_site_settings_header_nav_children_nested_icon" DEFAULT 'plus'
);
CREATE INDEX IF NOT EXISTS "site_settings_header_nav_children_order_idx" ON "site_settings_header_nav_children" ("_order");
CREATE INDEX IF NOT EXISTS "site_settings_header_nav_children_parent_id_idx" ON "site_settings_header_nav_children" ("_parent_id");
DO $$ BEGIN ALTER TABLE "site_settings_header_nav_children" ADD CONSTRAINT "site_settings_header_nav_children_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "site_settings_header_nav"("id") ON DELETE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "site_settings_header_nav_children_locales" (
  "label" varchar,
  "id" serial PRIMARY KEY NOT NULL,
  "_locale" "_locales" NOT NULL,
  "_parent_id" varchar NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "site_settings_header_nav_children_locales_locale_parent_id_u" ON "site_settings_header_nav_children_locales" ("_locale","_parent_id");
DO $$ BEGIN ALTER TABLE "site_settings_header_nav_children_locales" ADD CONSTRAINT "site_settings_header_nav_children_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "site_settings_header_nav_children"("id") ON DELETE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "site_settings_header_nav_children_sub_items" (
  "_order" integer NOT NULL,
  "_parent_id" varchar NOT NULL,
  "id" varchar PRIMARY KEY NOT NULL,
  "item_type" "enum_site_settings_header_nav_children_sub_items_item_type" DEFAULT 'link',
  "nav_link" "enum_site_settings_header_nav_children_sub_items_nav_link",
  "custom_href" varchar,
  "css_class" varchar,
  "nested_icon" "enum_site_settings_header_nav_children_sub_items_nested_icon" DEFAULT 'plus'
);
CREATE INDEX IF NOT EXISTS "site_settings_header_nav_children_sub_items_order_idx" ON "site_settings_header_nav_children_sub_items" ("_order");
CREATE INDEX IF NOT EXISTS "site_settings_header_nav_children_sub_items_parent_id_idx" ON "site_settings_header_nav_children_sub_items" ("_parent_id");
DO $$ BEGIN ALTER TABLE "site_settings_header_nav_children_sub_items" ADD CONSTRAINT "site_settings_header_nav_children_sub_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "site_settings_header_nav_children"("id") ON DELETE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "site_settings_header_nav_children_sub_items_locales" (
  "label" varchar,
  "id" serial PRIMARY KEY NOT NULL,
  "_locale" "_locales" NOT NULL,
  "_parent_id" varchar NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "site_settings_header_nav_children_sub_items_locales_locale_p" ON "site_settings_header_nav_children_sub_items_locales" ("_locale","_parent_id");
DO $$ BEGIN ALTER TABLE "site_settings_header_nav_children_sub_items_locales" ADD CONSTRAINT "site_settings_header_nav_children_sub_items_locales_paren_fk" FOREIGN KEY ("_parent_id") REFERENCES "site_settings_header_nav_children_sub_items"("id") ON DELETE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "site_settings_footer_columns" (
  "_order" integer NOT NULL,
  "_parent_id" integer NOT NULL,
  "id" varchar PRIMARY KEY NOT NULL
);
CREATE INDEX IF NOT EXISTS "site_settings_footer_columns_order_idx" ON "site_settings_footer_columns" ("_order");
CREATE INDEX IF NOT EXISTS "site_settings_footer_columns_parent_id_idx" ON "site_settings_footer_columns" ("_parent_id");
DO $$ BEGIN ALTER TABLE "site_settings_footer_columns" ADD CONSTRAINT "site_settings_footer_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "site_settings"("id") ON DELETE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "site_settings_footer_columns_locales" (
  "title" varchar NOT NULL,
  "id" serial PRIMARY KEY NOT NULL,
  "_locale" "_locales" NOT NULL,
  "_parent_id" varchar NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "site_settings_footer_columns_locales_locale_parent_id_unique" ON "site_settings_footer_columns_locales" ("_locale","_parent_id");
DO $$ BEGIN ALTER TABLE "site_settings_footer_columns_locales" ADD CONSTRAINT "site_settings_footer_columns_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "site_settings_footer_columns"("id") ON DELETE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "site_settings_footer_columns_links" (
  "_order" integer NOT NULL,
  "_parent_id" varchar NOT NULL,
  "id" varchar PRIMARY KEY NOT NULL,
  "nav_link" "enum_site_settings_footer_columns_links_nav_link",
  "custom_href" varchar,
  "open_in_new_tab" boolean DEFAULT false
);
CREATE INDEX IF NOT EXISTS "site_settings_footer_columns_links_order_idx" ON "site_settings_footer_columns_links" ("_order");
CREATE INDEX IF NOT EXISTS "site_settings_footer_columns_links_parent_id_idx" ON "site_settings_footer_columns_links" ("_parent_id");
DO $$ BEGIN ALTER TABLE "site_settings_footer_columns_links" ADD CONSTRAINT "site_settings_footer_columns_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "site_settings_footer_columns"("id") ON DELETE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "site_settings_footer_columns_links_locales" (
  "label" varchar NOT NULL,
  "id" serial PRIMARY KEY NOT NULL,
  "_locale" "_locales" NOT NULL,
  "_parent_id" varchar NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "site_settings_footer_columns_links_locales_locale_parent_id_" ON "site_settings_footer_columns_links_locales" ("_locale","_parent_id");
DO $$ BEGIN ALTER TABLE "site_settings_footer_columns_links_locales" ADD CONSTRAINT "site_settings_footer_columns_links_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "site_settings_footer_columns_links"("id") ON DELETE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "site_settings_footer_social" (
  "_order" integer NOT NULL,
  "_parent_id" integer NOT NULL,
  "id" varchar PRIMARY KEY NOT NULL,
  "network" "enum_site_settings_footer_social_network" NOT NULL,
  "url" varchar NOT NULL
);
CREATE INDEX IF NOT EXISTS "site_settings_footer_social_order_idx" ON "site_settings_footer_social" ("_order");
CREATE INDEX IF NOT EXISTS "site_settings_footer_social_parent_id_idx" ON "site_settings_footer_social" ("_parent_id");
DO $$ BEGIN ALTER TABLE "site_settings_footer_social" ADD CONSTRAINT "site_settings_footer_social_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "site_settings"("id") ON DELETE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "site_settings_footer_legal_links" (
  "_order" integer NOT NULL,
  "_parent_id" integer NOT NULL,
  "id" varchar PRIMARY KEY NOT NULL,
  "nav_link" "enum_site_settings_footer_legal_links_nav_link",
  "custom_href" varchar,
  "open_in_new_tab" boolean DEFAULT false
);
CREATE INDEX IF NOT EXISTS "site_settings_footer_legal_links_order_idx" ON "site_settings_footer_legal_links" ("_order");
CREATE INDEX IF NOT EXISTS "site_settings_footer_legal_links_parent_id_idx" ON "site_settings_footer_legal_links" ("_parent_id");
DO $$ BEGIN ALTER TABLE "site_settings_footer_legal_links" ADD CONSTRAINT "site_settings_footer_legal_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "site_settings"("id") ON DELETE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "site_settings_footer_legal_links_locales" (
  "label" varchar NOT NULL,
  "id" serial PRIMARY KEY NOT NULL,
  "_locale" "_locales" NOT NULL,
  "_parent_id" varchar NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "site_settings_footer_legal_links_locales_locale_parent_id_un" ON "site_settings_footer_legal_links_locales" ("_locale","_parent_id");
DO $$ BEGIN ALTER TABLE "site_settings_footer_legal_links_locales" ADD CONSTRAINT "site_settings_footer_legal_links_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "site_settings_footer_legal_links"("id") ON DELETE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
