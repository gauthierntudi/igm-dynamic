-- Valeurs enum nav_link pour « Dossier de presse »
DO $$ BEGIN
  ALTER TYPE "enum_site_settings_header_nav_nav_link" ADD VALUE '/dossier-de-presse';
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TYPE "enum_site_settings_header_nav_children_nav_link" ADD VALUE '/dossier-de-presse';
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TYPE "enum_site_settings_header_nav_children_sub_items_nav_link" ADD VALUE '/dossier-de-presse';
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TYPE "enum_site_settings_footer_columns_links_nav_link" ADD VALUE '/dossier-de-presse';
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TYPE "enum_site_settings_footer_legal_links_nav_link" ADD VALUE '/dossier-de-presse';
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TYPE "enum_who_we_are_cta_section_link_nav_link" ADD VALUE '/dossier-de-presse';
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TYPE "enum_who_we_are_contact_section_primary_cta_nav_link" ADD VALUE '/dossier-de-presse';
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
