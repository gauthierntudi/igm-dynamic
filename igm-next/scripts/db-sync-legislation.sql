-- Global Payload « legislation » (bannières pages législation)
CREATE TABLE IF NOT EXISTS "legislation" (
  "id" serial PRIMARY KEY NOT NULL,
  "ordinances_hero_image_id" integer,
  "laws_hero_image_id" integer,
  "decrees_hero_image_id" integer,
  "decisions_hero_image_id" integer,
  "updated_at" timestamp(3) with time zone,
  "created_at" timestamp(3) with time zone
);

DO $$ BEGIN ALTER TABLE "legislation" ADD CONSTRAINT "legislation_ordinances_hero_image_id_media_id_fk" FOREIGN KEY ("ordinances_hero_image_id") REFERENCES "media"("id") ON DELETE SET NULL; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "legislation" ADD CONSTRAINT "legislation_laws_hero_image_id_media_id_fk" FOREIGN KEY ("laws_hero_image_id") REFERENCES "media"("id") ON DELETE SET NULL; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "legislation" ADD CONSTRAINT "legislation_decrees_hero_image_id_media_id_fk" FOREIGN KEY ("decrees_hero_image_id") REFERENCES "media"("id") ON DELETE SET NULL; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "legislation" ADD CONSTRAINT "legislation_decisions_hero_image_id_media_id_fk" FOREIGN KEY ("decisions_hero_image_id") REFERENCES "media"("id") ON DELETE SET NULL; EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS "legislation_ordinances_hero_image_idx" ON "legislation" ("ordinances_hero_image_id");
CREATE INDEX IF NOT EXISTS "legislation_laws_hero_image_idx" ON "legislation" ("laws_hero_image_id");
CREATE INDEX IF NOT EXISTS "legislation_decrees_hero_image_idx" ON "legislation" ("decrees_hero_image_id");
CREATE INDEX IF NOT EXISTS "legislation_decisions_hero_image_idx" ON "legislation" ("decisions_hero_image_id");

INSERT INTO "legislation" ("id", "created_at", "updated_at")
SELECT 1, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM "legislation" WHERE "id" = 1);
