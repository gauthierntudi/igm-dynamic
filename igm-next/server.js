/**
 * Point d’entrée cPanel / Phusion Passenger (« Application startup file »).
 */
const { createServer } = require("http");
const { parse } = require("url");
const path = require("path");
const fs = require("fs");

/** Définit BASE_PATH depuis `cpanel-basepath.txt` si la variable n’est pas déjà posée (cPanel oublie souvent). */
(function ensureBasePathFromFile() {
  if (process.env.BASE_PATH?.trim()) return;
  try {
    const fp = path.join(__dirname, "cpanel-basepath.txt");
    if (!fs.existsSync(fp)) return;
    const raw = fs.readFileSync(fp, "utf8").trim().split(/\r?\n/, 1)[0]?.trim();
    if (!raw || raw === "/") return;
    let b = raw.replace(/\/$/, "");
    if (!b.startsWith("/")) b = `/${b}`;
    process.env.BASE_PATH = b;
  } catch {
    /* ignore */
  }
})();

const next = require("next");

const dir = path.resolve(__dirname);
const dev = process.env.NODE_ENV !== "production";
const port = Number.parseInt(
  process.env.PORT || process.env.PASSENGER_PORT || process.env.PASSENGER_LISTEN_PORT || "3000",
  10,
);

console.error(
  "[igm-next] cwd=%s appDir=%s NODE_ENV=%s BASE_PATH=%s PORT=%s",
  process.cwd(),
  dir,
  process.env.NODE_ENV || "(unset)",
  process.env.BASE_PATH || "(unset)",
  port,
);

const buildIdPath = path.join(dir, ".next", "BUILD_ID");
if (!fs.existsSync(buildIdPath)) {
  console.error(
    "[igm-next] Fichier absent: .next/BUILD_ID — exécutez sur le serveur: npm run build (voir package.json scripts build / build:cpanel)",
  );
  process.exit(1);
}

try {
  const rmPath = path.join(dir, ".next", "routes-manifest.json");
  if (fs.existsSync(rmPath)) {
    const manifest = JSON.parse(fs.readFileSync(rmPath, "utf8"));
    console.error("[igm-next] basePath compilé (.next/routes-manifest):", manifest.basePath || "(racine)");
  }
} catch (e) {
  console.error("[igm-next] Lecture routes-manifest impossible:", e);
}

const app = next({ dev, dir });
const handle = app.getRequestHandler();

app
  .prepare()
  .then(() => {
    const server = createServer((req, res) => {
      const parsedUrl = parse(req.url || "/", true);
      void handle(req, res, parsedUrl).catch((err) => {
        console.error("[igm-next] Erreur handler", req.url, err);
        res.statusCode = 500;
        res.end("Internal Server Error");
      });
    });

    server.listen(port, () => {
      console.error("[igm-next] Prêt, port", port);
    });

    server.on("error", (err) => {
      console.error("[igm-next] Écoute HTTP impossible:", err);
      process.exit(1);
    });
  })
  .catch((err) => {
    console.error("[igm-next] next.prepare() a échoué:", err);
    process.exit(1);
  });
