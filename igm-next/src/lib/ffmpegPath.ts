import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

/** Chemin binaire ffmpeg — évite le bundling webpack (.next/.../ffmpeg ENOENT). */
export function resolveFfmpegPath(): string {
  const fromEnv = process.env.FFMPEG_BIN?.trim();
  if (fromEnv) return fromEnv;

  const fromPackage = require("ffmpeg-static") as string | null;
  if (typeof fromPackage === "string" && fromPackage.length > 0) {
    return fromPackage;
  }

  throw new Error(
    "ffmpeg introuvable. Installez ffmpeg-static ou définissez FFMPEG_BIN dans .env.local",
  );
}
