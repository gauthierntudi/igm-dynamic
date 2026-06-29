"use client";

import { useEffect, useRef, useState } from "react";

import "./plyr-igm-theme.css";

type Props = {
  src: string;
  posterSrc?: string | null;
  title: string;
};

export function GalleryVideoPlayer({ src, posterSrc, title }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;

    let player: import("plyr").default | null = null;
    let cancelled = false;

    void (async () => {
      await import("plyr/dist/plyr.css");
      const { default: Plyr } = await import("plyr");

      if (cancelled || !videoRef.current) return;

      player = new Plyr(videoRef.current, {
        autoplay: true,
        controls: [
          "play-large",
          "play",
          "progress",
          "current-time",
          "duration",
          "mute",
          "volume",
          "settings",
          "pip",
          "fullscreen",
        ],
        settings: ["speed"],
        speed: { selected: 1, options: [0.75, 1, 1.25, 1.5] },
        ratio: "16:9",
        clickToPlay: true,
        hideControls: true,
      });

      const onReady = () => {
        setIsReady(true);
        void Promise.resolve(player?.play()).catch(() => undefined);
      };

      player.on("ready", onReady);
    })();

    return () => {
      cancelled = true;
      setIsReady(false);
      player?.destroy();
      player = null;
    };
  }, [src]);

  return (
    <div className={`igm-plyr-wrap${isReady ? " is-ready" : ""}`} key={src}>
      <video
        ref={videoRef}
        className="igm-plyr-video"
        playsInline
        poster={posterSrc ?? undefined}
        src={src}
        title={title}
      />
    </div>
  );
}
