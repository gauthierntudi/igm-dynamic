import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { spawn } from "node:child_process";
import { createWriteStream } from "node:fs";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { pipeline } from "node:stream/promises";
import type { CollectionAfterChangeHook } from "payload";
import sharp from "sharp";

import { publicPrefix } from "@/collections/mediaUploadConfig";
import { resolveFfmpegPath } from "@/lib/ffmpegPath";
import { s3MediaBucket, s3MediaClient, s3ObjectKey } from "@/lib/s3MediaClient";

const POSTER_SIZE = { width: 640, height: 360 } as const;
const SKIP_CONTEXT_KEY = "skipVideoPosterGeneration";
const S3_READY_RETRIES = 8;
const S3_READY_DELAY_MS = 1500;

function posterFilenameFor(videoFilename: string): string {
  const dot = videoFilename.lastIndexOf(".");
  const base = dot >= 0 ? videoFilename.slice(0, dot) : videoFilename;
  return `${base}-poster.jpg`;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function extractVideoFrame(inputPath: string, outputPath: string): Promise<void> {
  const ffmpegPath = resolveFfmpegPath();

  return new Promise((resolve, reject) => {
    const args = [
      "-hide_banner",
      "-loglevel",
      "error",
      "-ss",
      "00:00:01",
      "-i",
      inputPath,
      "-vframes",
      "1",
      "-q:v",
      "2",
      "-y",
      outputPath,
    ];

    const proc = spawn(ffmpegPath, args, { stdio: ["ignore", "pipe", "pipe"] });
    let stderr = "";

    proc.stderr.on("data", (chunk: Buffer) => {
      stderr += chunk.toString();
    });

    proc.on("error", reject);
    proc.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(stderr.trim() || `ffmpeg exit ${code}`));
    });
  });
}

async function downloadVideoFromS3(
  doc: { filename: string; prefix?: string | null },
  tmpDir: string,
): Promise<string> {
  const tmpVideo = path.join(tmpDir, doc.filename);
  const bucket = s3MediaBucket();
  const client = s3MediaClient();
  const key = s3ObjectKey(doc.prefix, doc.filename);

  let lastError: unknown;

  for (let attempt = 0; attempt < S3_READY_RETRIES; attempt += 1) {
    try {
      const response = await client.send(new GetObjectCommand({ Bucket: bucket, Key: key }));

      if (!response.Body) {
        throw new Error(`Fichier vidéo introuvable sur S3 : ${key}`);
      }

      await pipeline(response.Body as NodeJS.ReadableStream, createWriteStream(tmpVideo));
      return tmpVideo;
    } catch (err) {
      lastError = err;
      if (attempt < S3_READY_RETRIES - 1) {
        await sleep(S3_READY_DELAY_MS);
      }
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error(`Impossible de lire la vidéo sur S3 : ${key}`);
}

async function uploadPosterToS3(
  posterFilename: string,
  prefix: string | null | undefined,
  buffer: Buffer,
): Promise<void> {
  await s3MediaClient().send(
    new PutObjectCommand({
      Bucket: s3MediaBucket(),
      Key: s3ObjectKey(prefix, posterFilename),
      Body: buffer,
      ContentType: "image/jpeg",
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );
}

function needsPosterGeneration(
  doc: Record<string, unknown>,
  previousDoc: Record<string, unknown> | undefined,
): boolean {
  const sizes = doc.sizes as Record<string, { filename?: string }> | undefined;
  if (!sizes?.poster?.filename) return true;
  if (!previousDoc?.filename) return false;
  return previousDoc.filename !== doc.filename;
}

type VideoMediaDoc = {
  id: number | string;
  filename: string;
  mimeType?: string | null;
  prefix?: string | null;
  sizes?: unknown;
};

export async function createVideoPosterForDoc(
  payload: import("payload").Payload,
  doc: VideoMediaDoc,
  options?: { req?: import("payload").PayloadRequest },
): Promise<void> {
  if (!doc.mimeType?.startsWith("video/")) return;

  const prefix = typeof doc.prefix === "string" ? doc.prefix : publicPrefix;
  const posterFilename = posterFilenameFor(doc.filename);
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "igm-video-poster-"));
  const rawPosterPath = path.join(tmpDir, "poster-raw.jpg");

  try {
    const tmpVideo = await downloadVideoFromS3({ filename: doc.filename, prefix }, tmpDir);
    await extractVideoFrame(tmpVideo, rawPosterPath);

    const posterBuffer = await sharp(rawPosterPath)
      .resize(POSTER_SIZE.width, POSTER_SIZE.height, { fit: "cover", position: "center" })
      .jpeg({ quality: 82 })
      .toBuffer();

    const metadata = await sharp(posterBuffer).metadata();
    await uploadPosterToS3(posterFilename, prefix, posterBuffer);

    const existingSizes =
      doc.sizes && typeof doc.sizes === "object"
        ? (doc.sizes as Record<string, unknown>)
        : {};

    await payload.update({
      collection: "media",
      id: doc.id,
      data: {
        sizes: {
          ...existingSizes,
          poster: {
            filename: posterFilename,
            mimeType: "image/jpeg",
            filesize: posterBuffer.length,
            width: metadata.width ?? POSTER_SIZE.width,
            height: metadata.height ?? POSTER_SIZE.height,
            prefix,
          },
        },
      },
      req: options?.req,
      depth: 0,
      context: { [SKIP_CONTEXT_KEY]: true },
    });
  } finally {
    await fs.rm(tmpDir, { recursive: true, force: true }).catch(() => undefined);
  }
}

/** Lance la génération poster en arrière-plan (ne bloque pas le submit). */
export const generateVideoPoster: CollectionAfterChangeHook = async ({
  doc,
  previousDoc,
  req,
}) => {
  if (req.context?.[SKIP_CONTEXT_KEY]) return doc;
  if (!doc?.mimeType || typeof doc.mimeType !== "string") return doc;
  if (!doc.mimeType.startsWith("video/")) return doc;
  if (!doc.filename || typeof doc.filename !== "string") return doc;
  if (
    !needsPosterGeneration(
      doc as Record<string, unknown>,
      previousDoc as Record<string, unknown> | undefined,
    )
  ) {
    return doc;
  }

  const payload = req.payload;
  const videoDoc = doc as VideoMediaDoc;

  void createVideoPosterForDoc(payload, videoDoc, { req }).catch((err) => {
    payload.logger.error({
      err,
      msg: "[media] generateVideoPoster (async)",
      filename: doc.filename,
    });
  });

  return doc;
};
