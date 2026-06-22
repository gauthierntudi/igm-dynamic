-- Ambitions stratégie (home.strategy.ambitions)
CREATE TABLE IF NOT EXISTS "home_strategy_ambitions" (
  "_order" integer NOT NULL,
  "_parent_id" integer NOT NULL,
  "id" varchar PRIMARY KEY NOT NULL
);
CREATE INDEX IF NOT EXISTS "home_strategy_ambitions_order_idx" ON "home_strategy_ambitions" ("_order");
CREATE INDEX IF NOT EXISTS "home_strategy_ambitions_parent_id_idx" ON "home_strategy_ambitions" ("_parent_id");
DO $$ BEGIN
  ALTER TABLE "home_strategy_ambitions"
    ADD CONSTRAINT "home_strategy_ambitions_parent_id_fk"
    FOREIGN KEY ("_parent_id") REFERENCES "home"("id") ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "home_strategy_ambitions_locales" (
  "label" varchar,
  "id" serial PRIMARY KEY NOT NULL,
  "_locale" "_locales" NOT NULL,
  "_parent_id" varchar NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "home_strategy_ambitions_locales_locale_parent_id_unique"
  ON "home_strategy_ambitions_locales" ("_locale", "_parent_id");
DO $$ BEGIN
  ALTER TABLE "home_strategy_ambitions_locales"
    ADD CONSTRAINT "home_strategy_ambitions_locales_parent_id_fk"
    FOREIGN KEY ("_parent_id") REFERENCES "home_strategy_ambitions"("id") ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Libellé unique pour les axes (remplace highlight + text)
ALTER TABLE "home_strategy_axes_locales" ADD COLUMN IF NOT EXISTS "label" varchar;

-- Vidéo de fond (home.strategy.video)
ALTER TABLE "home" ADD COLUMN IF NOT EXISTS "strategy_video_id" integer;
DO $$ BEGIN
  ALTER TABLE "home"
    ADD CONSTRAINT "home_strategy_video_id_media_id_fk"
    FOREIGN KEY ("strategy_video_id") REFERENCES "media"("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE INDEX IF NOT EXISTS "home_strategy_strategy_video_idx" ON "home" ("strategy_video_id");
