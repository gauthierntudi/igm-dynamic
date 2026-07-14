"use client";

import { useState } from "react";

import "./plyr-igm-theme.css";

type Props = {
  embedSrc: string;
  title: string;
};

export function GalleryVideoPlayer({ embedSrc, title }: Props) {
  const [isReady, setIsReady] = useState(false);

  return (
    <div
      className={`igm-plyr-wrap igm-youtube-wrap${isReady ? " is-ready" : ""}`}
      style={{
        width: "min(1080px, 92vw)",
        height: "min(607px, calc(92vw * 9 / 16), calc(100dvh - 11.5rem))",
        maxWidth: "100%",
        maxHeight: "calc(100dvh - 11.5rem)",
      }}
    >
      <iframe
        className="igm-youtube-embed"
        src={embedSrc}
        title={title}
        width={1080}
        height={607}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
        loading="eager"
        onLoad={() => setIsReady(true)}
      />
    </div>
  );
}
