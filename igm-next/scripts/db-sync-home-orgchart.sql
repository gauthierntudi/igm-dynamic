-- Section organigramme (home.orgChartSection)
ALTER TABLE "home" ADD COLUMN IF NOT EXISTS "org_chart_section_diagram_id" integer;
DO $$ BEGIN
  ALTER TABLE "home"
    ADD CONSTRAINT "home_org_chart_section_diagram_id_media_id_fk"
    FOREIGN KEY ("org_chart_section_diagram_id") REFERENCES "media"("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE INDEX IF NOT EXISTS "home_org_chart_section_diagram_idx"
  ON "home" ("org_chart_section_diagram_id");

ALTER TABLE "home_locales" ADD COLUMN IF NOT EXISTS "org_chart_section_title_prefix" varchar;
ALTER TABLE "home_locales" ADD COLUMN IF NOT EXISTS "org_chart_section_title_highlight" varchar;
ALTER TABLE "home_locales" ADD COLUMN IF NOT EXISTS "org_chart_section_title_suffix" varchar;
ALTER TABLE "home_locales" ADD COLUMN IF NOT EXISTS "org_chart_section_lead" varchar;
ALTER TABLE "home_locales" ADD COLUMN IF NOT EXISTS "org_chart_section_cta_sidebar_title" varchar;
ALTER TABLE "home_locales" ADD COLUMN IF NOT EXISTS "org_chart_section_cta_label" varchar;
ALTER TABLE "home_locales" ADD COLUMN IF NOT EXISTS "org_chart_section_cta_href" varchar;

CREATE TABLE IF NOT EXISTS "home_org_chart_section_units" (
  "_order" integer NOT NULL,
  "_parent_id" integer NOT NULL,
  "id" varchar PRIMARY KEY NOT NULL,
  "image_id" integer
);
CREATE INDEX IF NOT EXISTS "home_org_chart_section_units_order_idx"
  ON "home_org_chart_section_units" ("_order");
CREATE INDEX IF NOT EXISTS "home_org_chart_section_units_parent_id_idx"
  ON "home_org_chart_section_units" ("_parent_id");
DO $$ BEGIN
  ALTER TABLE "home_org_chart_section_units"
    ADD CONSTRAINT "home_org_chart_section_units_parent_id_fk"
    FOREIGN KEY ("_parent_id") REFERENCES "home"("id") ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "home_org_chart_section_units"
    ADD CONSTRAINT "home_org_chart_section_units_image_id_media_id_fk"
    FOREIGN KEY ("image_id") REFERENCES "media"("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE INDEX IF NOT EXISTS "home_org_chart_section_units_image_idx"
  ON "home_org_chart_section_units" ("image_id");

CREATE TABLE IF NOT EXISTS "home_org_chart_section_units_locales" (
  "name" varchar,
  "role" varchar,
  "id" serial PRIMARY KEY NOT NULL,
  "_locale" "_locales" NOT NULL,
  "_parent_id" varchar NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "home_org_chart_section_units_locales_locale_parent_id_unique"
  ON "home_org_chart_section_units_locales" ("_locale", "_parent_id");
DO $$ BEGIN
  ALTER TABLE "home_org_chart_section_units_locales"
    ADD CONSTRAINT "home_org_chart_section_units_locales_parent_id_fk"
    FOREIGN KEY ("_parent_id") REFERENCES "home_org_chart_section_units"("id") ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
