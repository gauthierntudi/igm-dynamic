/**
 * @deprecated Utiliser npm run db:sync-new-collections
 * Table legislation_documents (Payload collection) sans prompt Drizzle.
 */
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const script = join(dirname(fileURLToPath(import.meta.url)), "db-sync-new-collections.mjs");
const result = spawnSync(process.execPath, ["--env-file=.env.local", script], { stdio: "inherit" });
process.exit(result.status ?? 1);
