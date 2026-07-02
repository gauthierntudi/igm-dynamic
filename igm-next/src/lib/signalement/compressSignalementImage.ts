/** Ne compresse que les images déjà > 1 Mo. */
export const SIGNALEMENT_IMAGE_COMPRESS_MIN_BYTES = 1024 * 1024;

export const SIGNALEMENT_IMAGE_MAX_EDGE_PX = 1920;

export const SIGNALEMENT_IMAGE_JPEG_QUALITY = 0.82;

export function shouldCompressSignalementImage(file: Pick<File, "type" | "size">): boolean {
  const mime = file.type.toLowerCase();
  if (mime !== "image/jpeg" && mime !== "image/png") {
    return false;
  }
  return file.size > SIGNALEMENT_IMAGE_COMPRESS_MIN_BYTES;
}

export async function compressSignalementImage(file: File): Promise<File> {
  if (!shouldCompressSignalementImage(file)) {
    return file;
  }

  if (typeof createImageBitmap === "undefined" || typeof document === "undefined") {
    return file;
  }

  let bitmap: ImageBitmap | null = null;

  try {
    bitmap = await createImageBitmap(file);
    const longestEdge = Math.max(bitmap.width, bitmap.height);
    const scale = longestEdge > SIGNALEMENT_IMAGE_MAX_EDGE_PX
      ? SIGNALEMENT_IMAGE_MAX_EDGE_PX / longestEdge
      : 1;
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return file;
    }

    ctx.drawImage(bitmap, 0, 0, width, height);

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, "image/jpeg", SIGNALEMENT_IMAGE_JPEG_QUALITY);
    });

    if (!blob || blob.size >= file.size) {
      return file;
    }

    const baseName = file.name.replace(/\.[^.]+$/i, "") || "photo";
    return new File([blob], `${baseName}.jpg`, {
      type: "image/jpeg",
      lastModified: Date.now(),
    });
  } catch {
    return file;
  } finally {
    bitmap?.close();
  }
}

export async function prepareSignalementUploadFile(file: File): Promise<File> {
  return compressSignalementImage(file);
}
