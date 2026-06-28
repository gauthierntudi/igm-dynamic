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
  webpack: (webpackConfig, { isServer }) => {
    webpackConfig.resolve.extensionAlias = {
      ".cjs": [".cts", ".cjs"],
      ".js": [".ts", ".tsx", ".js", ".jsx"],
      ".mjs": [".mts", ".mjs"],
    };
    webpackConfig.resolve.alias = {
      ...webpackConfig.resolve.alias,
      canvas: false,
      "@payloadcms/ui/dist/fields/Upload/HasOne/index.js": path.resolve(
        __dirname,
        "src/components/admin/MediaUploadHasOne.tsx",
      ),
      [path.resolve(__dirname, "node_modules/@payloadcms/next/dist/layouts/Root/index.js")]:
        path.resolve(__dirname, "src/patches/payloadcms-next-RootLayout.js"),
    };
    // pdfjs uniquement côté client (évite de polluer le bundle admin Payload).
    if (!isServer) {
      webpackConfig.resolve.alias["pdfjs-dist"] = path.resolve(
        __dirname,
        "node_modules/react-pdf/node_modules/pdfjs-dist",
      );
    }
    return webpackConfig;
  },
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default withPayload(nextConfig, { devBundleServerPackages: false });
