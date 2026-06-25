"use client";

import { useEffect } from "react";

/** Active le header transparent / texte blanc (comme le slider image-cover). */
export function HeaderHeroDarkBody() {
  useEffect(() => {
    document.body.classList.add("header-hero-dark");
    return () => {
      document.body.classList.remove("header-hero-dark");
    };
  }, []);

  return null;
}
