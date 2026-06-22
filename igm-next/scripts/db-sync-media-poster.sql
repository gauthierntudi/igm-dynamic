-- Colonnes sizes.poster pour vignettes vidéo (Payload imageSizes)
ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "sizes_poster_url" varchar;
ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "sizes_poster_width" numeric;
ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "sizes_poster_height" numeric;
ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "sizes_poster_mime_type" varchar;
ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "sizes_poster_filesize" numeric;
ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "sizes_poster_filename" varchar;
