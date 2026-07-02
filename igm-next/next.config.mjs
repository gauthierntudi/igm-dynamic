import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { withPayload } from "@payloadcms/next/withPayload";

import {
  createPayloadPatchPaths,
  turbopackPayloadAliases,
  webpackPayloadAliases,
} from "./nextPayloadPatches.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const payloadPatchPaths = createPayloadPatchPaths(__dirname);

function deployedBasePathFromEnv() {
  const raw = process.env.BASE_PATH?.trim();
  if (!raw || raw === "/") return undefined;
  let b = raw.replace(/\/$/, "");
  if (!b.startsWith("/")) b = `/${b}`;
  return b;
}

function deployedBasePathFromFile() {
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

/** @type {import('next').NextConfig} */
const nextConfig = {
  ...(basePath ? { basePath } : {}),
  allowedDevOrigins: ["192.168.1.68", "192.168.1.68:3000"],
  transpilePackages: ["react-pdf", "pdfjs-dist"],
  serverExternalPackages: ["ffmpeg-static", "pdfkit", "fontkit"],
  outputFileTracingIncludes: {
    "/[[...path]]": ["./html/**/*"],
    "/api/**": [
      "./node_modules/ffmpeg-static/**/*",
      "./node_modules/pdfkit/js/data/**/*",
    ],
  },
  images: {
    localPatterns: [
      {
        pathname: `${basePath ?? ""}/api/media/file/**`.replace("//", "/"),
      },
    ],
  },
  // Secours si un patch Payload casse sous Turbopack : npm run dev:webpack / build:webpack
  webpack: (webpackConfig, { isServer }) => {
    webpackConfig.resolve.extensionAlias = {
      ".cjs": [".cts", ".cjs"],
      ".js": [".ts", ".tsx", ".js", ".jsx"],
      ".mjs": [".mts", ".mjs"],
    };
    webpackConfig.resolve.alias = {
      ...webpackConfig.resolve.alias,
      ...webpackPayloadAliases(payloadPatchPaths, { isServer }),
    };
    return webpackConfig;
  },
  turbopack: {
    root: path.resolve(__dirname),
    resolveAlias: turbopackPayloadAliases(),
  },
};

export default withPayload(nextConfig, { devBundleServerPackages: false });
