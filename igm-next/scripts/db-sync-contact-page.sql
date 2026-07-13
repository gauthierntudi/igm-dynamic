-- Global Payload « contact-page » (page Contact)
CREATE TABLE IF NOT EXISTS "contact_page" (
  "id" serial PRIMARY KEY NOT NULL,
  "updated_at" timestamp(3) with time zone,
  "created_at" timestamp(3) with time zone
);

CREATE TABLE IF NOT EXISTS "contact_page_locales" (
  "seo_title" varchar DEFAULT 'Contact — IGM',
  "seo_description" varchar,
  "hero_title" varchar DEFAULT 'Contact',
  "hero_lead" varchar,
  "eyebrow" varchar DEFAULT 'Nous contacter',
  "form_title" varchar DEFAULT 'Nous serions ravis de vous lire',
  "info_title" varchar DEFAULT 'Nos coordonnées',
  "info_lead" varchar,
  "id" serial PRIMARY KEY NOT NULL,
  "_locale" "_locales" NOT NULL,
  "_parent_id" integer NOT NULL
);

DO $$ BEGIN ALTER TABLE "contact_page_locales" ADD CONSTRAINT "contact_page_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "contact_page"("id") ON DELETE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE UNIQUE INDEX IF NOT EXISTS "contact_page_locales_locale_parent_id_unique" ON "contact_page_locales" ("_locale","_parent_id");