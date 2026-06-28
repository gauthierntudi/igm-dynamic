"use client";

import { useEffect, useRef } from "react";

type Props = {
  src: string;
  posterSrc?: string | null;
  alt: string;
};

export function VideoThumbnail({ src, posterSrc, alt }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (posterSrc) return undefined;

    const video = videoRef.current;
    if (!video) return undefined;

    const seekToPreview = () => {
      try {
        video.currentTime = 0.5;
      } catch {
        /* ignore seek errors before metadata */
      }
    };

    video.addEventListener("loadedmetadata", seekToPreview);
    return () => video.removeEventListener("loadedmetadata", seekToPreview);
  }, [posterSrc, src]);

  if (posterSrc) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={posterSrc} alt={alt} loading="lazy" />
    );
  }

  return (
    <video
      ref={videoRef}
      className="igm-video-thumbnail__video"
      src={src}
      muted
      playsInline
      preload="metadata"
      aria-hidden
      tabIndex={-1}
    />
  );
}
