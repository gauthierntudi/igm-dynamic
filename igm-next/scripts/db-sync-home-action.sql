-- Section action terrain (home.actionSection)
ALTER TABLE "home_locales" ADD COLUMN IF NOT EXISTS "action_section_title_prefix" varchar;
ALTER TABLE "home_locales" ADD COLUMN IF NOT EXISTS "action_section_title_highlight" varchar;
ALTER TABLE "home_locales" ADD COLUMN IF NOT EXISTS "action_section_title_suffix" varchar;
ALTER TABLE "home_locales" ADD COLUMN IF NOT EXISTS "action_section_lead" varchar;
ALTER TABLE "home_locales" ADD COLUMN IF NOT EXISTS "action_section_cta_lead" varchar;
ALTER TABLE "home_locales" ADD COLUMN IF NOT EXISTS "action_section_cta_label" varchar;
ALTER TABLE "home_locales" ADD COLUMN IF NOT EXISTS "action_section_cta_href" varchar;

CREATE TABLE IF NOT EXISTS "home_action_section_items" (
  "_order" integer NOT NULL,
  "_parent_id" integer NOT NULL,
  "id" varchar PRIMARY KEY NOT NULL
);
CREATE INDEX IF NOT EXISTS "home_action_section_items_order_idx"
  ON "home_action_section_items" ("_order");
CREATE INDEX IF NOT EXISTS "home_action_section_items_parent_id_idx"
  ON "home_action_section_items" ("_parent_id");
DO $$ BEGIN
  ALTER TABLE "home_action_section_items"
    ADD CONSTRAINT "home_action_section_items_parent_id_fk"
    FOREIGN KEY ("_parent_id") REFERENCES "home"("id") ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "home_action_section_items_locales" (
  "title" varchar,
  "text" varchar,
  "id" serial PRIMARY KEY NOT NULL,
  "_locale" "_locales" NOT NULL,
  "_parent_id" varchar NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "home_action_section_items_locales_locale_parent_id_unique"
  ON "home_action_section_items_locales" ("_locale", "_parent_id");
DO $$ BEGIN
  ALTER TABLE "home_action_section_items_locales"
    ADD CONSTRAINT "home_action_section_items_locales_parent_id_fk"
    FOREIGN KEY ("_parent_id") REFERENCES "home_action_section_items"("id") ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
