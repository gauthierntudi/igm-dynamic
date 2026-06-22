import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { withPayload } from "@payloadcms/next/withPayload";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
  serverExternalPackages: ["ffmpeg-static"],
  outputFileTracingIncludes: {
    "/[[...path]]": ["./html/**/*"],
    "/api/**": ["./node_modules/ffmpeg-static/**/*"],
  },
  images: {
    localPatterns: [
      {
        pathname: `${basePath ?? ""}/api/media/file/**`.replace("//", "/"),
      },
    ],
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      ".cjs": [".cts", ".cjs"],
      ".js": [".ts", ".tsx", ".js", ".jsx"],
      ".mjs": [".mts", ".mjs"],
    };
    webpackConfig.resolve.alias = {
      ...webpackConfig.resolve.alias,
      "@payloadcms/ui/dist/fields/Upload/HasOne/index.js": path.resolve(
        __dirname,
        "src/components/admin/MediaUploadHasOne.tsx",
      ),
    };
    return webpackConfig;
  },
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default withPayload(nextConfig, { devBundleServerPackages: false });
