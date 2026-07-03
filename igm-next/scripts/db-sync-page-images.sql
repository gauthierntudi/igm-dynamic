-- Correctifs colonnes who-we-are (schéma Payload vs migrations manuelles)
ALTER TABLE "who_we_are_locales" ADD COLUMN IF NOT EXISTS "history_section_headline" varchar;
ALTER TABLE "who_we_are_locales" ADD COLUMN IF NOT EXISTS "history_section_body" varchar;

-- Images supplémentaires : Page À propos (who-we-are)
ALTER TABLE "who_we_are" ADD COLUMN IF NOT EXISTS "history_section_hero_image_id" integer;
ALTER TABLE "who_we_are" ADD COLUMN IF NOT EXISTS "history_section_cta_image_id" integer;
ALTER TABLE "who_we_are" ADD COLUMN IF NOT EXISTS "history_section_teaser_image1_id" integer;
ALTER TABLE "who_we_are" ADD COLUMN IF NOT EXISTS "history_section_teaser_image2_id" integer;
ALTER TABLE "who_we_are" ADD COLUMN IF NOT EXISTS "mission_section_image_id" integer;

DO $$ BEGIN ALTER TABLE "who_we_are" ADD CONSTRAINT "who_we_are_history_section_hero_image_id_media_id_fk" FOREIGN KEY ("history_section_hero_image_id") REFERENCES "media"("id") ON DELETE SET NULL; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "who_we_are" ADD CONSTRAINT "who_we_are_history_section_cta_image_id_media_id_fk" FOREIGN KEY ("history_section_cta_image_id") REFERENCES "media"("id") ON DELETE SET NULL; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "who_we_are" ADD CONSTRAINT "who_we_are_history_section_teaser_image1_id_media_id_fk" FOREIGN KEY ("history_section_teaser_image1_id") REFERENCES "media"("id") ON DELETE SET NULL; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "who_we_are" ADD CONSTRAINT "who_we_are_history_section_teaser_image2_id_media_id_fk" FOREIGN KEY ("history_section_teaser_image2_id") REFERENCES "media"("id") ON DELETE SET NULL; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "who_we_are" ADD CONSTRAINT "who_we_are_mission_section_image_id_media_id_fk" FOREIGN KEY ("mission_section_image_id") REFERENCES "media"("id") ON DELETE SET NULL; EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS "who_we_are_history_section_hero_image_idx" ON "who_we_are" ("history_section_hero_image_id");
CREATE INDEX IF NOT EXISTS "who_we_are_history_section_cta_image_idx" ON "who_we_are" ("history_section_cta_image_id");
CREATE INDEX IF NOT EXISTS "who_we_are_history_section_teaser_image1_idx" ON "who_we_are" ("history_section_teaser_image1_id");
CREATE INDEX IF NOT EXISTS "who_we_are_history_section_teaser_image2_idx" ON "who_we_are" ("history_section_teaser_image2_id");
CREATE INDEX IF NOT EXISTS "who_we_are_mission_section_image_idx" ON "who_we_are" ("mission_section_image_id");

-- Bandeau CTA : pages CMS (LCFCM, etc.)
ALTER TABLE "pages" ADD COLUMN IF NOT EXISTS "hero_cta_media_id" integer;

DO $$ BEGIN ALTER TABLE "pages" ADD CONSTRAINT "pages_hero_cta_media_id_media_id_fk" FOREIGN KEY ("hero_cta_media_id") REFERENCES "media"("id") ON DELETE SET NULL; EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS "pages_hero_cta_media_idx" ON "pages" ("hero_cta_media_id");

-- Bandeau CTA : table des versions (_pages_v)
ALTER TABLE "_pages_v" ADD COLUMN IF NOT EXISTS "version_hero_cta_media_id" integer;

DO $$ BEGIN ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_hero_cta_media_id_media_id_fk" FOREIGN KEY ("version_hero_cta_media_id") REFERENCES "media"("id") ON DELETE SET NULL; EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS "_pages_v_version_hero_version_hero_cta_media_idx" ON "_pages_v" ("version_hero_cta_media_id");

-- Bandeaux CTA LCFCM : global page-heroes
ALTER TABLE "page_heroes" ADD COLUMN IF NOT EXISTS "fraud_cta_hero_image_id" integer;
ALTER TABLE "page_heroes" ADD COLUMN IF NOT EXISTS "smuggling_cta_hero_image_id" integer;
ALTER TABLE "page_heroes" ADD COLUMN IF NOT EXISTS "sanctions_cta_hero_image_id" integer;

DO $$ BEGIN ALTER TABLE "page_heroes" ADD CONSTRAINT "page_heroes_fraud_cta_hero_image_id_media_id_fk" FOREIGN KEY ("fraud_cta_hero_image_id") REFERENCES "media"("id") ON DELETE SET NULL; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "page_heroes" ADD CONSTRAINT "page_heroes_smuggling_cta_hero_image_id_media_id_fk" FOREIGN KEY ("smuggling_cta_hero_image_id") REFERENCES "media"("id") ON DELETE SET NULL; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "page_heroes" ADD CONSTRAINT "page_heroes_sanctions_cta_hero_image_id_media_id_fk" FOREIGN KEY ("sanctions_cta_hero_image_id") REFERENCES "media"("id") ON DELETE SET NULL; EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS "page_heroes_fraud_cta_hero_image_idx" ON "page_heroes" ("fraud_cta_hero_image_id");
CREATE INDEX IF NOT EXISTS "page_heroes_smuggling_cta_hero_image_idx" ON "page_heroes" ("smuggling_cta_hero_image_id");
CREATE INDEX IF NOT EXISTS "page_heroes_sanctions_cta_hero_image_idx" ON "page_heroes" ("sanctions_cta_hero_image_id");
