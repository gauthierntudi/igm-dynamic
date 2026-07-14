"use client";

import { useEffect, useState } from "react";

type Props = {
  images: string[];
  /** Délai entre deux slides (ms). */
  intervalMs?: number;
};

/** Fond héro animé (fondu) pour une liste d’URL d’images. */
export function AboutHeroBackgroundSlideshow({ images, intervalMs = 5500 }: Props) {
  const unique = [...new Set(images.map((src) => src.trim()).filter(Boolean))];
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (unique.length <= 1) return;

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % unique.length);
    }, intervalMs);

    return () => window.clearInterval(timer);
  }, [intervalMs, unique.length]);

  if (unique.length === 0) return null;

  if (unique.length === 1) {
    return (
      <div
        className="about-hero__slide is-active"
        style={{ backgroundImage: `url(${JSON.stringify(unique[0])})` }}
        aria-hidden
      />
    );
  }

  return (
    <div className="about-hero__slideshow" aria-hidden>
      {unique.map((src, index) => (
        <div
          key={src}
          className={`about-hero__slide${index === activeIndex ? " is-active" : ""}`}
          style={{ backgroundImage: `url(${JSON.stringify(src)})` }}
        />
      ))}
    </div>
  );
}
