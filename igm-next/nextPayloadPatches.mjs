import path from "node:path";

/**
 * Patches Payload CMS routés via alias bundler (webpack + Turbopack).
 *
 * - RootLayout : suppressHydrationWarning sur <html>/<body> (extensions navigateur).
 * - MediaUploadHasOne : vignettes vidéo custom dans l’admin.
 *
 * Revoir à chaque mise à jour majeure de @payloadcms/next / @payloadcms/ui.
 * Fallback webpack : `npm run dev:webpack` / `npm run build:webpack`.
 */
export function createPayloadPatchPaths(dirname) {
  return {
    mediaUploadHasOne: path.resolve(dirname, "src/components/admin/MediaUploadHasOne.tsx"),
    rootLayoutPatch: path.resolve(dirname, "src/patches/payloadcms-next-RootLayout.js"),
    payloadRootLayout: path.resolve(
      dirname,
      "node_modules/@payloadcms/next/dist/layouts/Root/index.js",
    ),
    pdfjsDist: path.resolve(dirname, "node_modules/react-pdf/node_modules/pdfjs-dist"),
    canvasStub: path.resolve(dirname, "src/lib/stubs/canvas-stub.js"),
  };
}

/** Alias webpack (build de secours et compatibilité Payload). */
export function webpackPayloadAliases(patchPaths, { isServer }) {
  const aliases = {
    canvas: false,
    "@payloadcms/ui/dist/fields/Upload/HasOne/index.js": patchPaths.mediaUploadHasOne,
    [patchPaths.payloadRootLayout]: patchPaths.rootLayoutPatch,
    "@payloadcms/next/dist/layouts/Root/index.js": patchPaths.rootLayoutPatch,
  };
  if (!isServer) {
    aliases["pdfjs-dist"] = patchPaths.pdfjsDist;
  }
  return aliases;
}

/** Alias Turbopack (dev + build par défaut Next.js 16). Chemins relatifs au projet. */
export function turbopackPayloadAliases() {
  return {
    "@payloadcms/next/dist/layouts/Root/index.js": "./src/patches/payloadcms-next-RootLayout.js",
    "@payloadcms/ui/dist/fields/Upload/HasOne/index.js": "./src/components/admin/MediaUploadHasOne.tsx",
    canvas: "./src/lib/stubs/canvas-stub.js",
    "pdfjs-dist": {
      browser: "./node_modules/react-pdf/node_modules/pdfjs-dist",
    },
  };
}
