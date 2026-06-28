import fs from "fs/promises";
import path from "path";

import type { SignalementFile } from "@/payload-types";

function fileStreamPath(file: SignalementFile, apiRoute: string): string | null {
  if (!file.filename) return null;
  const prefix =
    typeof file.prefix === "string" && file.prefix
      ? `?prefix=${encodeURIComponent(file.prefix)}`
      : "";
  return `${apiRoute}/signalement-files/file/${encodeURIComponent(file.filename)}${prefix}`;
}

async function readLocalSignalementFile(filename: string): Promise<Buffer | null> {
  const candidates = [
    path.join(process.cwd(), "signalement-files", filename),
    path.join(process.cwd(), "media", "signalement-files", filename),
  ];

  for (const candidate of candidates) {
    try {
      return await fs.readFile(candidate);
    } catch {
      // try next path
    }
  }

  return null;
}

export async function fetchSignalementFileBuffer(
  file: SignalementFile,
  options: {
    apiRoute: string;
    cookieHeader?: string | null;
    origin?: string | null;
  },
): Promise<Buffer | null> {
  if (!file.filename) return null;

  const local = await readLocalSignalementFile(file.filename);
  if (local) return local;

  const streamPath = fileStreamPath(file, options.apiRoute);
  if (!streamPath) return null;

  const url = streamPath.startsWith("http")
    ? streamPath
    : `${options.origin ?? "http://127.0.0.1:3000"}${streamPath}`;

  try {
    const response = await fetch(url, {
      headers: options.cookieHeader ? { cookie: options.cookieHeader } : undefined,
    });
    if (!response.ok) return null;
    return Buffer.from(await response.arrayBuffer());
  } catch {
    return null;
  }
}
