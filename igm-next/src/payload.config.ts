import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { s3Storage } from "@payloadcms/storage-s3";
import path from "path";
import { buildConfig } from "payload";
import { fileURLToPath } from "url";
import sharp from "sharp";

import { Media, mediaS3CollectionConfig } from "./collections/Media";
import { News } from "./collections/News";
import { Pages } from "./collections/Pages";
import { SignalementFiles, signalementFilesS3CollectionConfig } from "./collections/SignalementFiles";
import { Signalements } from "./collections/Signalements";
import { Stats } from "./collections/Stats";
import { Users } from "./collections/Users";
import { SiteSettings } from "./globals/SiteSettings";
import { Home } from "./globals/Home";
import { WhoWeAre } from "./globals/WhoWeAre";
import { mediaFilenameVersioningPlugin } from "./plugins/mediaFilenameVersioning";
import { videoPosterPlugin } from "./plugins/videoPosterPlugin";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const databaseUri = process.env.DATABASE_URI || process.env.DATABASE_URL || "";

const s3Enabled = Boolean(
  process.env.S3_BUCKET && process.env.S3_ACCESS_KEY_ID && process.env.S3_SECRET_ACCESS_KEY,
);

/** Upload direct navigateur → S3 (nécessite CORS PUT sur le bucket). Désactivé en dev local. */
function s3ClientUploadsEnabled(): boolean {
  if (process.env.PAYLOAD_CLIENT_UPLOADS === "true") return true;
  if (process.env.PAYLOAD_CLIENT_UPLOADS === "false") return false;
  return process.env.NODE_ENV === "production";
}

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
      // Évite la régénération à chaque requête admin en dev (lancer generate:importmap manuellement).
      autoGenerate: process.env.NODE_ENV === "production",
    },
    meta: {
      titleSuffix: "— IGM",
    },
  },
  collections: [Users, Media, SignalementFiles, Pages, News, Stats, Signalements],
  globals: [SiteSettings, Home, WhoWeAre],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || "",
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  db: postgresAdapter({
    pool: {
      connectionString: databaseUri,
    },
    // Évite le prompt interactif Drizzle à chaque requête (bloque le serveur).
    // Après changement de schéma : npm run db:sync-site-settings
    push: false,
  }),
  sharp,
  localization: {
    locales: [
      { label: "Français", code: "fr" },
      { label: "English", code: "en" },
    ],
    defaultLocale: "fr",
    fallback: true,
  },
  plugins: [
    ...(s3Enabled
      ? [
          s3Storage({
            collections: {
              media: mediaS3CollectionConfig,
              "signalement-files": signalementFilesS3CollectionConfig,
            },
            bucket: process.env.S3_BUCKET!,
            config: {
              credentials: {
                accessKeyId: process.env.S3_ACCESS_KEY_ID!,
                secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
              },
              region: process.env.S3_REGION || "eu-central-1",
            },
            clientUploads: s3ClientUploadsEnabled(),
          }),
          mediaFilenameVersioningPlugin(),
          videoPosterPlugin(),
        ]
      : []),
  ],
});
