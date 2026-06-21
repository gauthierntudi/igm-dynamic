import fs from "node:fs";
import path from "node:path";

import type { NextConfig } from "next";

/** Lecture `BASE_PATH` depuis l’environnement (build CI / cPanel). */
function deployedBasePathFromEnv(): string | undefined {
  const raw = process.env.BASE_PATH?.trim();
  if (!raw || raw === "/") return undefined;
  let b = raw.replace(/\/$/, "");
  if (!b.startsWith("/")) b = `/${b}`;
  return b;
}

/**
 * Fichier optionnel à la racine du projet (`cpanel-basepath.txt`), une ligne, ex. `/igm`.
 * Permet au build sur le serveur d’avoir un `basePath` même sans variable d’environnement.
 * Ne pas commiter le fichier réel (voir `.gitignore`) ; copier depuis `cpanel-basepath.example`.
 */
function deployedBasePathFromFile(): string | undefined {
  try {
    const fp = path.join(__dirname, "cpanel-basepath.txt");
    if (!fs.existsSync(fp)) return undefined;
    const raw = fs.readFileSync(fp, "utf8").trim().split(/\r?\n/)[0]?.trim();
    if (!raw || raw === "/") return undefined;
    let b = raw.replace(/\/$/, "");
    if (!b.startsWith("/")) b = `/${b}`;
    return b;
  } catch {
    return undefined;
  }
}

const basePath = deployedBasePathFromEnv() ?? deployedBasePathFromFile();

/**
 * Inclut `html/` dans le bundle serverless (Vercel) : la page d’accueil lit ce fichier via fs.
 * @see https://nextjs.org/docs/app/api-reference/config/next-config-js/outputFileTracingIncludes
 */
const nextConfig: NextConfig = {
  ...(basePath ? { basePath } : {}),
  outputFileTracingIncludes: {
    "/[[...path]]": ["./html/**/*"],
  },
};

export default nextConfig;
