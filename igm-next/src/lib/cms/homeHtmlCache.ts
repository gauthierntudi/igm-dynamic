import { readFile } from "node:fs/promises";
import { unstable_cache } from "next/cache";

async function readHomeHtmlShellUncached(filePath: string): Promise<string> {
  return readFile(filePath, "utf8");
}

/** Cache la lecture du fichier HTML d'accueil (évite I/O disque à chaque requête). */
export function loadHomeHtmlFile(filePath: string): Promise<string> {
  const cached = unstable_cache(
    () => readHomeHtmlShellUncached(filePath),
    ["home-html-file", filePath],
    { tags: ["home-html-shell"], revalidate: 300 },
  );
  return cached();
}
