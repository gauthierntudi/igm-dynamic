-- Schéma collection news : contenu riche + SEO (aligné sur pages_locales).
ALTER TABLE "news_locales" ADD COLUMN IF NOT EXISTS "content" jsonb;
ALTER TABLE "news_locales" ADD COLUMN IF NOT EXISTS "content_html" varchar;
ALTER TABLE "news_locales" ADD COLUMN IF NOT EXISTS "seo_title" varchar;
ALTER TABLE "news_locales" ADD COLUMN IF NOT EXISTS "seo_description" varchar;

ALTER TABLE "_news_v_locales" ADD COLUMN IF NOT EXISTS "version_content" jsonb;
ALTER TABLE "_news_v_locales" ADD COLUMN IF NOT EXISTS "version_content_html" varchar;
ALTER TABLE "_news_v_locales" ADD COLUMN IF NOT EXISTS "version_seo_title" varchar;
ALTER TABLE "_news_v_locales" ADD COLUMN IF NOT EXISTS "version_seo_description" varchar;

ALTER TABLE "news_locales" ADD COLUMN IF NOT EXISTS "generate_slug" boolean DEFAULT true;
ALTER TABLE "_news_v_locales" ADD COLUMN IF NOT EXISTS "version_generate_slug" boolean DEFAULT true;

ALTER TABLE "news_locales" ADD COLUMN IF NOT EXISTS "category_custom" varchar;
ALTER TABLE "_news_v_locales" ADD COLUMN IF NOT EXISTS "version_category_custom" varchar;

-- Section actualités accueil : 3 articles par défaut.
ALTER TABLE "home" ALTER COLUMN "news_section_max_items" SET DEFAULT 3;
