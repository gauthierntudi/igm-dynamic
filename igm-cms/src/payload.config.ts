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

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const databaseUri = process.env.DATABASE_URI || process.env.DATABASE_URL || "";

const s3Enabled = Boolean(
  process.env.S3_BUCKET && process.env.S3_ACCESS_KEY_ID && process.env.S3_SECRET_ACCESS_KEY,
);

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      titleSuffix: "— IGM",
    },
  },
  collections: [Users, Media, SignalementFiles, Pages, News, Stats, Signalements],
  globals: [SiteSettings],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || "",
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  db: postgresAdapter({
    pool: {
      connectionString: databaseUri,
    },
  }),
  sharp,
  localization: {
    locales: ["fr"],
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
            clientUploads: true,
          }),
        ]
      : []),
  ],
});
