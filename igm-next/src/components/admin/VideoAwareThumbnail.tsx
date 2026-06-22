"use client";

import { Thumbnail } from "@payloadcms/ui";
import React from "react";

import { createClientVideoThumbnail } from "@/lib/admin/createClientVideoThumbnail";

type Props = {
  alt?: string;
  className?: string;
  file?: File | null;
  fileSrc?: string | null;
  filename?: string;
  imageCacheTag?: string | boolean;
  mimeType?: string | null;
  size?: "small" | "medium";
};

/** Vignette admin : images directes, vidéos via poster serveur ou frame client. */
export function VideoAwareThumbnail({
  className,
  file,
  fileSrc,
  filename,
  imageCacheTag,
  mimeType,
  size = "small",
}: Props) {
  const [clientSrc, setClientSrc] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const isVideo =
    (typeof mimeType === "string" && mimeType.startsWith("video/")) ||
    (file?.type?.startsWith("video/") ?? false);

  React.useEffect(() => {
    if (!isVideo || !file || fileSrc) {
      setClientSrc(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setClientSrc(null);

    void createClientVideoThumbnail(file)
      .then((url) => {
        if (!cancelled) setClientSrc(url);
      })
      .catch(() => {
        if (!cancelled) setClientSrc(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [file, fileSrc, isVideo]);

  const resolvedSrc = fileSrc || clientSrc;

  if (isVideo && loading && !resolvedSrc) {
    return <div className={["thumbnail", "thumbnail--size-small", className].filter(Boolean).join(" ")} />;
  }

  return (
    <Thumbnail
      className={className}
      doc={{ filename: filename ?? "" }}
      fileSrc={resolvedSrc ?? undefined}
      imageCacheTag={typeof imageCacheTag === "string" ? imageCacheTag : undefined}
      size={size}
    />
  );
}
